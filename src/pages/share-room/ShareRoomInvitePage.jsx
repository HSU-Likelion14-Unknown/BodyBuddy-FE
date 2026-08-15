import { useEffect } from 'react';
import { MdGroupAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import styles from './ShareRoomInvitePage.module.scss';

export default function ShareRoomInvitePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/share-room/preview', {
        replace: true,
        state: {
          roomName: '알수없음조',
          view: 'records',
        },
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [navigate]);

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
