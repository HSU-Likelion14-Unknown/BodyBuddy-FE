import { useEffect, useState } from 'react';
import { getMealImageBlob } from '@/api/meals';
import {
  getMyRooms,
  getRoomFeed,
  getRoomMembers,
  resolveImageUrl,
} from '@/api/rooms';
import { getMyInfo } from '@/api/user';

const ROOM_POLL_INTERVAL_MS = 3000;
const PHOTO_RETRY_INTERVAL_MS = 30000;

// 피드 date 파라미터는 KST 기준
function todayInKst() {
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kstNow.toISOString().slice(0, 10);
}

function toRecord(feed) {
  return {
    id: feed.mealId,
    image: '',
    photoUrl: feed.photoUrl ?? '',
    foods: feed.foodNames ?? [],
    eatenAt: feed.eatenAt ?? '',
    recommendation: '',
    reactions: [],
  };
}

function labelRecords(records) {
  return [...records]
    .sort((left, right) => {
      const leftTime = Date.parse(left.eatenAt);
      const rightTime = Date.parse(right.eatenAt);

      if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime)) {
        const timeDifference = leftTime - rightTime;

        if (timeDifference !== 0) return timeDifference;
      }

      return String(left.id).localeCompare(String(right.id));
    })
    .map((record, index) => ({
      ...record,
      label: `기록${index + 1}`,
    }));
}

// 멤버 목록 + 피드 → 화면용 형태로 조립
function toMembers(members, feeds, currentUserId) {
  const recordsByUser = feeds.reduce((grouped, feed) => {
    const list = grouped[feed.userId] ?? [];
    list.push(toRecord(feed));
    grouped[feed.userId] = list;
    return grouped;
  }, {});

  const feedProfileByUser = feeds.reduce((grouped, feed) => {
    if (feed.profileImageUrl && !grouped[feed.userId]) {
      grouped[feed.userId] = feed.profileImageUrl;
    }
    return grouped;
  }, {});

  return members.map((member) => {
    const records = labelRecords(recordsByUser[member.userId] ?? []);

    return {
      id: member.userId,
      nickname: member.nickname ?? '이름 없음',
      isMe:
        member.isMe === true ||
        (Boolean(currentUserId) && member.userId === currentUserId),
      avatar: resolveImageUrl(
        member.profileImageUrl || feedProfileByUser[member.userId],
      ),
      records,
    };
  });
}

function getPhotoCacheKey(record) {
  return `${record.id}:${record.photoUrl}`;
}

// 사진 조회에 인증 필요 — 변경되지 않은 사진은 객체 URL을 재사용
async function attachPhotos(members, signal, photoCache, photoRetryAfter) {
  const activePhotoKeys = new Set();

  await Promise.all(
    members.flatMap((member) =>
      member.records.map(async (record) => {
        if (!record.photoUrl) return;

        const cacheKey = getPhotoCacheKey(record);
        activePhotoKeys.add(cacheKey);

        const cachedObjectUrl = photoCache.get(cacheKey);

        if (cachedObjectUrl) {
          record.image = cachedObjectUrl;
          return;
        }

        const retryAfter = photoRetryAfter.get(cacheKey) ?? 0;

        if (retryAfter > Date.now()) return;

        photoRetryAfter.delete(cacheKey);

        try {
          const blob = await getMealImageBlob(record.photoUrl, { signal });

          if (!blob || signal.aborted) return;

          const objectUrl = URL.createObjectURL(blob);
          photoCache.set(cacheKey, objectUrl);
          photoRetryAfter.delete(cacheKey);
          record.image = objectUrl;
        } catch {
          if (!signal.aborted) {
            photoRetryAfter.set(
              cacheKey,
              Date.now() + PHOTO_RETRY_INTERVAL_MS,
            );
          }
        }
      }),
    ),
  );

  if (signal.aborted) return;

  photoCache.forEach((objectUrl, cacheKey) => {
    if (activePhotoKeys.has(cacheKey)) return;

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    photoCache.delete(cacheKey);
  });

  photoRetryAfter.forEach((_, cacheKey) => {
    if (!activePhotoKeys.has(cacheKey)) photoRetryAfter.delete(cacheKey);
  });
}

function clearPhotoCache(photoCache, photoRetryAfter) {
  photoCache.forEach((objectUrl) => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  });
  photoCache.clear();
  photoRetryAfter.clear();
}

export function useRoomFeed(roomId) {
  const [members, setMembers] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!roomId) return undefined;

    const photoCache = new Map();
    const photoRetryAfter = new Map();
    let currentUserId = '';
    let hasLoadedRoomList = false;
    let hasLoadedSnapshot = false;
    let isRefreshing = false;
    let isStopped = false;
    let shouldRefreshImmediately = false;
    let refreshController = null;
    let pollTimer;

    const scheduleNextRefresh = () => {
      window.clearTimeout(pollTimer);

      if (isStopped || document.hidden) return;

      pollTimer = window.setTimeout(refresh, ROOM_POLL_INTERVAL_MS);
    };

    const refresh = async () => {
      if (isStopped || document.hidden || isRefreshing) return;

      shouldRefreshImmediately = false;
      isRefreshing = true;
      const controller = new AbortController();
      refreshController = controller;

      try {
        const roomListRequest = hasLoadedRoomList
          ? Promise.resolve(null)
          : getMyRooms({ signal: controller.signal })
              .then((result) => {
                hasLoadedRoomList = true;
                return result;
              })
              .catch(() => null);
        const myInfoRequest = currentUserId
          ? Promise.resolve(null)
          : getMyInfo({ signal: controller.signal }).catch(() => null);
        const [memberResult, feedResult, roomResult, myInfo] =
          await Promise.all([
            getRoomMembers(roomId, { signal: controller.signal }),
            getRoomFeed(roomId, todayInKst(), { signal: controller.signal }),
            roomListRequest,
            myInfoRequest,
          ]);

        if (myInfo?.userId) currentUserId = myInfo.userId;

        const nextMembers = toMembers(
          memberResult.members ?? [],
          feedResult.feeds ?? [],
          currentUserId,
        );
        await attachPhotos(
          nextMembers,
          controller.signal,
          photoCache,
          photoRetryAfter,
        );

        if (isStopped || controller.signal.aborted || document.hidden) return;

        setMembers(nextMembers);
        setErrorMessage('');
        hasLoadedSnapshot = true;

        if (roomResult) {
          setRoomInfo(
            (roomResult.rooms ?? []).find((room) => room.roomId === roomId) ??
              null,
          );
        }
      } catch (error) {
        if (isStopped || controller.signal.aborted) return;

        if (!hasLoadedSnapshot) {
          setErrorMessage(
            error?.response?.data?.message ?? '공유방을 불러오지 못했어요.',
          );
        }
      } finally {
        isRefreshing = false;

        if (refreshController === controller) refreshController = null;

        if (!isStopped && !controller.signal.aborted) {
          setIsLoading(false);
        }

        if (!isStopped) {
          if (shouldRefreshImmediately && !document.hidden) {
            shouldRefreshImmediately = false;
            void refresh();
          } else {
            scheduleNextRefresh();
          }
        }
      }
    };

    const refreshWhenVisible = () => {
      window.clearTimeout(pollTimer);

      if (document.hidden) {
        shouldRefreshImmediately = true;
        refreshController?.abort();
        return;
      }

      if (isRefreshing) {
        if (refreshController?.signal.aborted) {
          shouldRefreshImmediately = true;
        }
        return;
      }

      void refresh();
    };

    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener('focus', refreshWhenVisible);
    void refresh();

    return () => {
      isStopped = true;
      window.clearTimeout(pollTimer);
      refreshController?.abort();
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener('focus', refreshWhenVisible);
      clearPhotoCache(photoCache, photoRetryAfter);
    };
  }, [roomId]);

  return { members, roomInfo, isLoading, errorMessage };
}
