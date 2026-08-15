import { useState } from 'react';
import { MdClose, MdContentCopy, MdShare } from 'react-icons/md';
import styles from './InviteDialog.module.scss';

export default function InviteDialog({ inviteCode, roomName, onClose }) {
  const [isCopied, setIsCopied] = useState(false);
  const inviteUrl = `${window.location.origin}/share-room/invite/${inviteCode}`;

  const copyInviteUrl = () => {
    navigator.clipboard?.writeText(inviteUrl);
    setIsCopied(true);
  };

  const shareInviteUrl = () => {
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
            value={inviteUrl}
            readOnly
            onFocus={(event) => event.target.select()}
          />
          <button type="button" onClick={copyInviteUrl}>
            <MdContentCopy />
            {isCopied ? '복사 완료' : '복사'}
          </button>
        </div>

        <p className={styles.expiration}>24시간 동안 사용할 수 있어요.</p>

        <button
          type="button"
          className={styles.shareButton}
          onClick={shareInviteUrl}
        >
          <MdShare />
          링크 공유하기
        </button>
      </section>
    </div>
  );
}
