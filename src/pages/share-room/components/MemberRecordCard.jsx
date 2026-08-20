import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit3 } from 'react-icons/fi';
import { getMealReactions, putMealReactions } from '@/api/rooms';
import { shareRoomAddIcon } from '@/assets';
import styles from './MemberRecordCard.module.scss';

// id = 서버 ReactionEmoji enum 값
const REACTION_OPTIONS = [
  { id: 'FIRE', emoji: '🔥', label: '최고예요' },
  { id: 'HEART', emoji: '❤️', label: '좋아요' },
  { id: 'YUMMY', emoji: '🤤', label: '맛있겠어요' },
  { id: 'SAD', emoji: '😩', label: '힘들겠어요' },
  { id: 'THUMBS_DOWN', emoji: '🤮', label: '아쉬워요' },
  { id: 'ANGRY', emoji: '😡', label: '화나요' },
];

const OPTION_BY_ID = Object.fromEntries(
  REACTION_OPTIONS.map((option) => [option.id, option]),
);

const REACTION_POLL_INTERVAL = 3000;

function MemberAvatar({ nickname, src }) {
  const [failedUrl, setFailedUrl] = useState('');

  if (!src || failedUrl === src) {
    return (
      <span className={`${styles.avatar} ${styles.avatarFallback}`} aria-hidden>
        {nickname.trim().slice(0, 1) || '?'}
      </span>
    );
  }

  return (
    <img
      className={styles.avatar}
      src={src}
      alt={`${nickname} 프로필`}
      onError={() => setFailedUrl(src)}
    />
  );
}

function MealMedia({ record }) {
  const [failedUrl, setFailedUrl] = useState('');
  const hasPhoto = Boolean(record.photoUrl);
  const imageUrl = record.image;

  if (!hasPhoto) {
    return (
      <div className={styles.manualMealContent}>
        <span className={styles.manualMealIcon} aria-hidden="true">
          <FiEdit3 />
        </span>
        <div className={styles.manualMealText}>
          <strong>직접 입력한 식사</strong>
          <span>사진 없이 음식명으로 기록했어요.</span>
        </div>
      </div>
    );
  }

  if (!imageUrl || failedUrl === imageUrl) {
    return (
      <div className={styles.imageFallback}>
        <strong>사진을 불러오지 못했어요.</strong>
        <span>음식 목록은 아래에서 확인할 수 있어요.</span>
      </div>
    );
  }

  return (
    <div className={styles.mealImageContent}>
      <img
        className={record.crop ? styles[record.crop] : ''}
        src={imageUrl}
        alt={record.foods.join(', ') || '식사 사진'}
        onError={() => setFailedUrl(imageUrl)}
      />
      {record.recommendation && <span>{record.recommendation}</span>}
    </div>
  );
}

export default function MemberRecordCard({ member, roomId }) {
  const navigate = useNavigate();
  const [selectedMealId, setSelectedMealId] = useState(() => {
    if (Number.isInteger(member.initialRecordIndex)) {
      return member.records[member.initialRecordIndex]?.id ?? '';
    }

    return member.records[member.records.length - 1]?.id ?? '';
  });
  const [myReactions, setMyReactions] = useState([]);
  const [reactionCounts, setReactionCounts] = useState([]);
  const [reactionTargetKey, setReactionTargetKey] = useState('');
  const [isSavingReaction, setIsSavingReaction] = useState(false);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const recordTabsRef = useRef(null);
  const activeRecordButtonRef = useRef(null);
  const isMountedRef = useRef(false);
  const isSavingReactionRef = useRef(false);
  const reactionRequestSequenceRef = useRef(0);
  const reactionFetchControllerRef = useRef(null);
  const requestReactionRefreshRef = useRef(() => {});

  const hasRecords = member.records.length > 0;
  const selectedRecordIndex = member.records.findIndex(
    (record) => record.id === selectedMealId,
  );
  const activeRecordIndex =
    selectedRecordIndex >= 0
      ? selectedRecordIndex
      : Math.max(member.records.length - 1, 0);
  const selectedRecord = member.records[activeRecordIndex];
  const selectedRecordId = selectedRecord?.id;
  const isManualRecord = hasRecords && !selectedRecord?.photoUrl;
  const selectedReactionTargetKey =
    roomId && selectedRecordId ? `${roomId}:${selectedRecordId}` : '';
  const visibleMyReactions =
    reactionTargetKey === selectedReactionTargetKey ? myReactions : [];
  const visibleReactionCounts =
    reactionTargetKey === selectedReactionTargetKey ? reactionCounts : [];

  useEffect(() => {
    const tabs = recordTabsRef.current;
    const activeButton = activeRecordButtonRef.current;

    if (!tabs || !activeButton) return;

    const tabsRect = tabs.getBoundingClientRect();
    const activeButtonRect = activeButton.getBoundingClientRect();

    if (activeButtonRect.left < tabsRect.left) {
      tabs.scrollLeft -= tabsRect.left - activeButtonRect.left;
    } else if (activeButtonRect.right > tabsRect.right) {
      tabs.scrollLeft += activeButtonRect.right - tabsRect.right;
    }
  }, [member.records.length, selectedRecordId]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      isSavingReactionRef.current = false;
      reactionRequestSequenceRef.current += 1;
      reactionFetchControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!roomId || !selectedRecordId) return undefined;

    let isActive = true;
    let timerId;
    let isRequestInFlight = false;
    let shouldRefreshImmediately = false;

    function clearRefreshTimer() {
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
        timerId = undefined;
      }
    }

    function scheduleNextRefresh() {
      clearRefreshTimer();

      if (!isActive || document.hidden) return;

      timerId = window.setTimeout(
        requestImmediateRefresh,
        REACTION_POLL_INTERVAL,
      );
    }

    async function refreshReactions() {
      if (!isActive || document.hidden) return;

      if (isRequestInFlight) {
        if (reactionFetchControllerRef.current?.signal.aborted) {
          shouldRefreshImmediately = true;
        }
        return;
      }

      if (isSavingReactionRef.current) {
        shouldRefreshImmediately = true;
        return;
      }

      shouldRefreshImmediately = false;
      isRequestInFlight = true;

      const controller = new AbortController();
      const requestSequence = reactionRequestSequenceRef.current + 1;

      reactionRequestSequenceRef.current = requestSequence;
      reactionFetchControllerRef.current = controller;

      try {
        const data = await getMealReactions(roomId, selectedRecordId, {
          signal: controller.signal,
        });

        if (
          !isActive ||
          controller.signal.aborted ||
          requestSequence !== reactionRequestSequenceRef.current
        ) {
          return;
        }

        setMyReactions(data.myReactions ?? []);
        setReactionCounts(data.reactions ?? []);
        setReactionTargetKey(selectedReactionTargetKey);
      } catch {
        // 반응 조회 실패는 기록 표시에 영향 없음
      } finally {
        isRequestInFlight = false;

        if (reactionFetchControllerRef.current === controller) {
          reactionFetchControllerRef.current = null;
        }

        if (
          shouldRefreshImmediately &&
          isActive &&
          !document.hidden &&
          !isSavingReactionRef.current
        ) {
          void refreshReactions();
        } else {
          scheduleNextRefresh();
        }
      }
    }

    function requestImmediateRefresh() {
      clearRefreshTimer();

      if (!isActive || document.hidden) return;

      if (isRequestInFlight) {
        if (reactionFetchControllerRef.current?.signal.aborted) {
          shouldRefreshImmediately = true;
        }
        return;
      }

      if (isSavingReactionRef.current) {
        shouldRefreshImmediately = true;
        return;
      }

      void refreshReactions();
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        clearRefreshTimer();
        reactionFetchControllerRef.current?.abort();
        return;
      }

      requestImmediateRefresh();
    }

    function handleWindowFocus() {
      if (!document.hidden) requestImmediateRefresh();
    }

    requestReactionRefreshRef.current = requestImmediateRefresh;
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    requestImmediateRefresh();

    return () => {
      isActive = false;
      reactionRequestSequenceRef.current += 1;
      clearRefreshTimer();
      reactionFetchControllerRef.current?.abort();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);

      if (requestReactionRefreshRef.current === requestImmediateRefresh) {
        requestReactionRefreshRef.current = () => {};
      }
    };
  }, [roomId, selectedReactionTargetKey, selectedRecordId]);

  // 서버는 26종 허용 — 화면에 아이콘 있는 것만 노출
  const reactions = visibleReactionCounts
    .map(({ emojiType, count }) => ({
      ...OPTION_BY_ID[emojiType],
      id: emojiType,
      count,
    }))
    .filter((reaction) => reaction.emoji);

  const selectRecord = (mealId) => {
    setSelectedMealId(mealId);
    setIsReactionPickerOpen(false);
  };

  // 서버는 복수 허용 — 화면은 단일 선택 유지
  const leaveReaction = async (option) => {
    if (
      !roomId ||
      !selectedRecordId ||
      isSavingReaction ||
      isSavingReactionRef.current
    ) {
      return;
    }

    const nextReactions = visibleMyReactions.includes(option.id)
      ? []
      : [option.id];
    const mutationSequence = reactionRequestSequenceRef.current + 1;

    reactionRequestSequenceRef.current = mutationSequence;
    reactionFetchControllerRef.current?.abort();
    isSavingReactionRef.current = true;
    setIsSavingReaction(true);

    try {
      const data = await putMealReactions(
        roomId,
        selectedRecordId,
        nextReactions,
      );

      if (
        isMountedRef.current &&
        mutationSequence === reactionRequestSequenceRef.current
      ) {
        setMyReactions(data.myReactions ?? nextReactions);
        setReactionCounts(data.reactions ?? []);
        setReactionTargetKey(selectedReactionTargetKey);
      }
    } catch {
      // 실패 시 기존 반응 유지
    } finally {
      isSavingReactionRef.current = false;

      if (isMountedRef.current) {
        setIsSavingReaction(false);
        setIsReactionPickerOpen(false);
        requestReactionRefreshRef.current();
      }
    }
  };

  return (
    <article
      className={`${styles.card} ${
        hasRecords ? styles.recorded : styles.empty
      } ${isManualRecord ? styles.manualRecorded : ''}`}
    >
      <header className={styles.memberHeader}>
        <MemberAvatar nickname={member.nickname} src={member.avatar} />

        <div className={styles.memberContent}>
          <h2>
            {member.nickname}
            {member.isMe && ' (나)'}
          </h2>

          {hasRecords && (
            <div ref={recordTabsRef} className={styles.recordTabs}>
              {member.records.map((record, index) => (
                <button
                  key={record.id}
                  ref={
                    index === activeRecordIndex
                      ? activeRecordButtonRef
                      : undefined
                  }
                  type="button"
                  className={index === activeRecordIndex ? styles.active : ''}
                  onClick={() => selectRecord(record.id)}
                >
                  {record.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {hasRecords ? (
        <>
          <MealMedia record={selectedRecord} />

          <div className={styles.foodList}>
            {selectedRecord.foods.map((food) => (
              <span key={food}>{food}</span>
            ))}
          </div>

          <div className={styles.reactionContent}>
            <div className={styles.reactionList}>
              {reactions.map((reaction) => (
                <button
                  key={reaction.id}
                  type="button"
                  className={`${styles.reactionButton} ${
                    visibleMyReactions.includes(reaction.id)
                      ? styles.selected
                      : ''
                  }`}
                  title={`${reaction.label} 반응 ${
                    visibleMyReactions.includes(reaction.id)
                      ? '취소'
                      : '남기기'
                  }`}
                  onClick={() => leaveReaction(reaction)}
                >
                  <span className={styles.reactionEmoji}>{reaction.emoji}</span>
                  <span className={styles.reactionCount}>{reaction.count}</span>
                </button>
              ))}

              <button
                type="button"
                className={`${styles.addReactionButton} ${
                  reactions.length > 0 ? styles.compact : ''
                }`}
                title="반응 선택하기"
                onClick={() => setIsReactionPickerOpen((isOpen) => !isOpen)}
              >
                {reactions.length === 0 && '반응 남기기'}
                <span>
                  <img src={shareRoomAddIcon} alt="" />
                </span>
              </button>
            </div>

            {isReactionPickerOpen && (
              <div className={styles.reactionPicker}>
                {REACTION_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={
                      visibleMyReactions.includes(option.id)
                        ? styles.selected
                        : ''
                    }
                    title={option.label}
                    onClick={() => leaveReaction(option)}
                  >
                    {option.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className={styles.noResponse}>...응답 없음...</div>
          {member.isMe && (
            <button
              type="button"
              className={styles.recordButton}
              onClick={() => navigate('/meals/new')}
            >
              <img src={shareRoomAddIcon} alt="" />
              기록하러 가기
            </button>
          )}
        </>
      )}
    </article>
  );
}
