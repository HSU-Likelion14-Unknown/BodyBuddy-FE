import { useEffect, useRef, useState } from 'react';
import { MdClose, MdContentCopy, MdShare } from 'react-icons/md';
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

export default function InviteDialog({ invite, roomName, onClose }) {
  const [isCopied, setIsCopied] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const inviteUrl = invite?.code
    ? `${window.location.origin}/share-room/invite/${encodeURIComponent(invite.code)}`
    : '';

  const copyInviteUrl = async () => {
    if (!inviteUrl) return false;

    try {
      if (!navigator.clipboard?.writeText) throw new Error('CLIPBOARD_MISSING');

      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
      setActionMessage('');
      return true;
    } catch {
      setActionMessage(
        '링크를 복사하지 못했어요. 주소를 길게 눌러 복사해 주세요.',
      );
      return false;
    }
  };

  const shareInviteUrl = async () => {
    if (!inviteUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${roomName} 초대`,
          text: '바디버디에서 식사를 함께 기록해요.',
          url: inviteUrl,
        });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }

    await copyInviteUrl();
  };

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          title="닫기"
          onClick={onClose}
        >
          <MdClose />
        </button>

        <div className={styles.titleContent}>
          <h2 id="invite-dialog-title">친구를 공유방에 초대해요.</h2>
          <p>링크를 받은 친구는 별도의 코드 입력 없이 바로 참여할 수 있어요.</p>
        </div>

        <div className={styles.linkContent}>
          <input
            type="text"
            value={inviteUrl}
            aria-label="초대 링크"
            readOnly
            onFocus={(event) => event.target.select()}
          />
          <button type="button" disabled={!inviteUrl} onClick={copyInviteUrl}>
            <MdContentCopy />
            {isCopied ? '복사 완료' : '복사'}
          </button>
        </div>

        <p className={styles.expiration} aria-live="polite">
          {actionMessage || (invite ? toExpiryText(invite.expiresAt) : '')}
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
