import { useEffect, useState } from 'react';
import { getMealImageBlob } from '@/api/meals';
import { getRoomFeed, getRoomMembers } from '@/api/rooms';
import { shareRoomFriendAvatar, shareRoomOwnerAvatar } from '@/assets';

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
    recommendation: '',
    reactions: [],
  };
}

// 멤버 목록 + 피드 → 화면용 형태로 조립
function toMembers(members, feeds) {
  const recordsByUser = feeds.reduce((grouped, feed) => {
    const list = grouped[feed.userId] ?? [];
    list.push(toRecord(feed));
    grouped[feed.userId] = list;
    return grouped;
  }, {});

  return members.map((member, index) => ({
    id: member.userId,
    nickname: member.nickname ?? '이름 없음',
    avatar: index === 0 ? shareRoomOwnerAvatar : shareRoomFriendAvatar,
    records: recordsByUser[member.userId] ?? [],
  }));
}

// 사진 조회에 인증 필요 — img src 불가, blob 받아 객체 URL 생성
async function attachPhotos(members, signal, objectUrls) {
  await Promise.all(
    members.flatMap((member) =>
      member.records.map(async (record) => {
        if (!record.photoUrl) return;

        try {
          const blob = await getMealImageBlob(record.photoUrl, { signal });

          if (!blob) return;

          const objectUrl = URL.createObjectURL(blob);
          objectUrls.push(objectUrl);
          record.image = objectUrl;
        } catch {
          // 사진 한 장 실패는 피드 전체에 영향 없음
        }
      }),
    ),
  );
}

export function useRoomFeed(roomId) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!roomId) return undefined;

    const controller = new AbortController();
    const objectUrls = [];

    const load = async () => {
      try {
        const [memberResult, feedResult] = await Promise.all([
          getRoomMembers(roomId, { signal: controller.signal }),
          getRoomFeed(roomId, todayInKst(), { signal: controller.signal }),
        ]);

        const nextMembers = toMembers(
          memberResult.members ?? [],
          feedResult.feeds ?? [],
        );
        await attachPhotos(nextMembers, controller.signal, objectUrls);

        if (controller.signal.aborted) return;

        setMembers(nextMembers);
      } catch (error) {
        if (controller.signal.aborted) return;

        setErrorMessage(
          error?.response?.data?.message ?? '공유방을 불러오지 못했어요.',
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    load();

    return () => {
      controller.abort();
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [roomId]);

  return { members, isLoading, errorMessage };
}
