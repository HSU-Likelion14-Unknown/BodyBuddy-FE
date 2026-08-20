import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function MemberRecordCard({ member, roomId }) {
  const navigate = useNavigate();
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(
    member.initialRecordIndex ?? 0,
  );
  const [myReactions, setMyReactions] = useState([]);
  const [reactionCounts, setReactionCounts] = useState([]);
  const [isSavingReaction, setIsSavingReaction] = useState(false);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);

  const hasRecords = member.records.length > 0;
  const selectedRecord = member.records[selectedRecordIndex];
  const selectedRecordId = selectedRecord?.id;

  useEffect(() => {
    if (!roomId || !selectedRecordId) return undefined;

    const controller = new AbortController();

    getMealReactions(roomId, selectedRecordId, { signal: controller.signal })
      .then((data) => {
        setMyReactions(data.myReactions ?? []);
        setReactionCounts(data.reactions ?? []);
      })
      .catch(() => {
        // 반응 조회 실패는 기록 표시에 영향 없음
      });

    return () => controller.abort();
  }, [roomId, selectedRecordId]);

  // 서버는 26종 허용 — 화면에 아이콘 있는 것만 노출
  const reactions = reactionCounts
    .map(({ emojiType, count }) => ({
      ...OPTION_BY_ID[emojiType],
      id: emojiType,
      count,
    }))
    .filter((reaction) => reaction.emoji);

  const selectRecord = (index) => {
    setSelectedRecordIndex(index);
    setIsReactionPickerOpen(false);
  };

  // 서버는 복수 허용 — 화면은 단일 선택 유지
  const leaveReaction = async (option) => {
    if (!roomId || !selectedRecordId || isSavingReaction) return;

    const nextReactions = myReactions.includes(option.id) ? [] : [option.id];

    setIsSavingReaction(true);

    try {
      const data = await putMealReactions(
        roomId,
        selectedRecordId,
        nextReactions,
      );

      setMyReactions(data.myReactions ?? nextReactions);
      setReactionCounts(data.reactions ?? []);
    } catch {
      // 실패 시 기존 반응 유지
    } finally {
      setIsSavingReaction(false);
      setIsReactionPickerOpen(false);
    }
  };

  return (
    <article
      className={`${styles.card} ${hasRecords ? styles.recorded : styles.empty}`}
    >
      <header className={styles.memberHeader}>
        <img className={styles.avatar} src={member.avatar} />

        <div className={styles.memberContent}>
          <h2>
            {member.nickname}
            {member.isMe && ' (나)'}
          </h2>

          {hasRecords && (
            <div className={styles.recordTabs}>
              {member.records.map((record, index) => (
                <button
                  key={record.id}
                  type="button"
                  className={index === selectedRecordIndex ? styles.active : ''}
                  onClick={() => selectRecord(index)}
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
          <div className={styles.mealImageContent}>
            <img
              className={selectedRecord.crop ? styles[selectedRecord.crop] : ''}
              src={selectedRecord.image}
              alt={selectedRecord.foods.join(', ')}
            />
            <span>{selectedRecord.recommendation}</span>
          </div>

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
                    myReactions.includes(reaction.id) ? styles.selected : ''
                  }`}
                  title={`${reaction.label} 반응 ${
                    myReactions.includes(reaction.id) ? '취소' : '남기기'
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
                      myReactions.includes(option.id) ? styles.selected : ''
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
