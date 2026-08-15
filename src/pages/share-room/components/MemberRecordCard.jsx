import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shareRoomAddIcon } from '@/assets';
import styles from './MemberRecordCard.module.scss';

const REACTION_OPTIONS = [
  { id: 'fire', emoji: '🔥', label: '최고예요' },
  { id: 'heart', emoji: '❤️', label: '좋아요' },
  { id: 'yum', emoji: '🤤', label: '맛있겠어요' },
  { id: 'tired', emoji: '😩', label: '힘들겠어요' },
  { id: 'dislike', emoji: '🤮', label: '아쉬워요' },
  { id: 'angry', emoji: '😡', label: '화나요' },
];

const createReactionState = (records) =>
  Object.fromEntries(
    records.map((record) => [
      record.id,
      {
        items: record.reactions.map((reaction) => ({ ...reaction })),
        selectedReactionId: null,
      },
    ]),
  );

const changeReactionCount = (reactions, option, amount) => {
  const targetReaction = reactions.find(
    (reaction) => reaction.id === option.id,
  );

  if (!targetReaction) {
    return amount > 0
      ? [...reactions, { ...option, count: amount }]
      : reactions;
  }

  return reactions
    .map((reaction) =>
      reaction.id === option.id
        ? { ...reaction, count: reaction.count + amount }
        : reaction,
    )
    .filter((reaction) => reaction.count > 0);
};

export default function MemberRecordCard({ member }) {
  const navigate = useNavigate();
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(
    member.initialRecordIndex ?? 0,
  );
  const [reactionState, setReactionState] = useState(() =>
    createReactionState(member.records),
  );
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const hasRecords = member.records.length > 0;
  const selectedRecord = member.records[selectedRecordIndex];
  const selectedReactionState = selectedRecord
    ? reactionState[selectedRecord.id]
    : null;
  const reactions = selectedReactionState?.items ?? [];

  const selectRecord = (index) => {
    setSelectedRecordIndex(index);
    setIsReactionPickerOpen(false);
  };

  const leaveReaction = (option) => {
    const recordId = selectedRecord.id;

    setReactionState((currentState) => {
      const currentReactionState = currentState[recordId];
      const previousReactionId = currentReactionState.selectedReactionId;
      const previousOption = REACTION_OPTIONS.find(
        (reactionOption) => reactionOption.id === previousReactionId,
      );
      let nextItems = currentReactionState.items;

      if (previousOption) {
        nextItems = changeReactionCount(nextItems, previousOption, -1);
      }

      const nextReactionId =
        previousReactionId === option.id ? null : option.id;

      if (nextReactionId) {
        nextItems = changeReactionCount(nextItems, option, 1);
      }

      return {
        ...currentState,
        [recordId]: {
          items: nextItems,
          selectedReactionId: nextReactionId,
        },
      };
    });

    setIsReactionPickerOpen(false);
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
                    selectedReactionState.selectedReactionId === reaction.id
                      ? styles.selected
                      : ''
                  }`}
                  title={`${reaction.label} 반응 ${
                    selectedReactionState.selectedReactionId === reaction.id
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
                      selectedReactionState.selectedReactionId === option.id
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
