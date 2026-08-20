import { useEffect, useState } from 'react';
import { MdErrorOutline, MdGroupAdd } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '@/api/error';
import { joinRoom } from '@/api/rooms';
import styles from './ShareRoomInvitePage.module.scss';

export default function ShareRoomInvitePage() {
  const navigate = useNavigate();
  const { code } = useParams();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!code) return undefined;

    let cancelled = false;

    const join = async () => {
      try {
        const room = await joinRoom(code);

        if (cancelled) return;

        navigate(`/share-room/${room.roomId}`, {
          replace: true,
          state: { roomName: room.roomName },
        });
      } catch (error) {
        if (cancelled) return;

        setErrorMessage(
          getApiErrorMessage(error, '공유방에 참여하지 못했어요.'),
        );
      }
    };

    join();

    return () => {
      cancelled = true;
    };
  }, [code, navigate]);

  const failureMessage = code ? errorMessage : '초대 코드가 없어요.';

  if (failureMessage) {
    return (
      <main className={styles.container}>
        <div className={`${styles.iconContent} ${styles.errorIcon}`}>
          <MdErrorOutline />
        </div>
        <h1>공유방에 참여할 수 없어요.</h1>
        <p>{failureMessage}</p>
        <button
          type="button"
          className={styles.homeButton}
          onClick={() => navigate('/home', { replace: true })}
        >
          홈으로 가기
        </button>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.iconContent}>
        <MdGroupAdd />
      </div>
      <h1>친구의 공유방에 참여하는 중이에요.</h1>
      <p>잠시만 기다려 주세요.</p>
      <div className={styles.loadingDots}>
        <span />
        <span />
        <span />
      </div>
    </main>
  );
}
