import ShareRoomSection from './components/ShareRoomSection';
import styles from './HomePage.module.scss';

export default function HomePage() {
  return (
    <main className={styles.container}>
      {/* 친구 공유방 */}
      <ShareRoomSection />
    </main>
  );
}
