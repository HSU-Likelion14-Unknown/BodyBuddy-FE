import { useEffect, useState } from 'react';
import { MdClose, MdContentCopy, MdShare } from 'react-icons/md';
import { getApiErrorMessage } from '@/api/error';
import { createRoomInvite } from '@/api/rooms';
import styles from './InviteDialog.module.scss';

// 서버가 준 만료 시각으로 남은 사용 시간 안내
function toExpiryText(expiresAt) {
  const expires = Date.parse(expiresAt);

  if (!Number.isFinite(expires)) return '';

  const minutes = Math.max(Math.round((expires - Date.now()) / 60000), 0);

  return minutes >= 60
    ? `${Math.floor(minutes / 60)}시간 동안 사용할 수 있어요.`
    : `${minutes}분 동안 사용할 수 있어요.`;
}

export default function InviteDialog({ roomId, roomName, onClose }) {
  const [invite, setInvite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!roomId) return undefined;

    let cancelled = false;

    // 초대 코드는 일회성이라 다이얼로그를 열 때마다 새로 발급 받음
    createRoomInvite(roomId)
      .then((data) => {
        if (!cancelled) setInvite(data);
      })
      .catch((error) => {
        if (cancelled) return;

        setErrorMessage(
          getApiErrorMessage(error, '초대 코드를 만들지 못했어요.'),
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const inviteUrl = invite
    ? `${window.location.origin}/share-room/invite/${invite.code}`
    : '';

  const copyInviteUrl = () => {
    if (!inviteUrl) return;

    navigator.clipboard?.writeText(inviteUrl);
    setIsCopied(true);
  };

  const shareInviteUrl = () => {
    if (!inviteUrl) return;

    if (navigator.share) {
      navigator.share({
        title: `${roomName} 초대`,
        text: '바디버디에서 식사를 함께 기록해요.',
        url: inviteUrl,
      });
      return;
    }

    copyInviteUrl();
  };

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <section
        className={styles.dialog}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeButton}
          title="닫기"
          onClick={onClose}
        >
          <MdClose />
        </button>

        <div className={styles.titleContent}>
          <h2>친구를 공유방에 초대해요.</h2>
          <p>링크를 받은 친구는 별도의 코드 입력 없이 바로 참여할 수 있어요.</p>
        </div>

        <div className={styles.linkContent}>
          <input
            type="text"
            value={isLoading ? '초대 링크를 만드는 중이에요.' : inviteUrl}
            readOnly
            onFocus={(event) => event.target.select()}
          />
          <button type="button" disabled={!inviteUrl} onClick={copyInviteUrl}>
            <MdContentCopy />
            {isCopied ? '복사 완료' : '복사'}
          </button>
        </div>

        <p className={styles.expiration}>
          {errorMessage || (invite ? toExpiryText(invite.expiresAt) : '')}
        </p>

        <button
          type="button"
          className={styles.shareButton}
          disabled={!inviteUrl}
          onClick={shareInviteUrl}
        >
          <MdShare />
          링크 공유하기
        </button>
      </section>
    </div>
  );
}
