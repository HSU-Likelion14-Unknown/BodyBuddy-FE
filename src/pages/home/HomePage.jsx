import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa6';
import {
  homeHeroCamera,
  homeHeroCurves,
  homeHeroDotRight,
  homeHeroDotTop,
  homeHeroIron,
  homeHeroMagnesium,
  homeHeroPlus,
  homeHeroRays,
  homeHeroZinc,
} from '@/assets';
import ShareRoomSection from './components/ShareRoomSection';
import WeeklyCalendar from './components/WeeklyCalendar';
import styles from './HomePage.module.scss';

const MOCK_RECOMMENDATION = {
  name: '연어 구이',
  description:
    '연어 100g으로 비타민 D와 오메가3의 하루 권장량의 80%를 채울 수 있어요.',
  tip: '다음 끼니에 추가하면 밸런스가 좋아요.',
};

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className={styles.container}>
      {/* 식사 기록 */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>
            나의 영양소
            <br />
            기록하러 가기
          </h1>
          <span className={styles.divider} />
          <p>바디버디가 00님의 영양소를 채워드릴게요!</p>

          <button
            type="button"
            className={styles.recordButton}
            onClick={() => navigate('/meals/new')}
          >
            <FiArrowRight />
            <span>식사 기록하러 가기</span>
          </button>

          <div className={styles.heroVisual}>
            <img
              className={`${styles.heroAsset} ${styles.camera}`}
              src={homeHeroCamera}
              alt=""
            />
            <img
              className={`${styles.heroAsset} ${styles.magnesium}`}
              src={homeHeroMagnesium}
              alt=""
            />
            <img
              className={`${styles.heroAsset} ${styles.iron}`}
              src={homeHeroIron}
              alt=""
            />
            <img
              className={`${styles.heroAsset} ${styles.zinc}`}
              src={homeHeroZinc}
              alt=""
            />
            <img
              className={`${styles.heroAsset} ${styles.plus}`}
              src={homeHeroPlus}
              alt=""
            />
            <img
              className={`${styles.heroAsset} ${styles.dotTop}`}
              src={homeHeroDotTop}
              alt=""
            />
            <img
              className={`${styles.heroAsset} ${styles.dotRight}`}
              src={homeHeroDotRight}
              alt=""
            />
            <img
              className={`${styles.heroAsset} ${styles.rays}`}
              src={homeHeroRays}
              alt=""
            />
            <img
              className={`${styles.heroAsset} ${styles.curves}`}
              src={homeHeroCurves}
              alt=""
            />
          </div>
        </div>
      </section>

      <div className={styles.content}>
        {/* 오늘의 추천 음식 */}
        <section className={styles.recommendation}>
          <div className={styles.recommendationTitle}>
            <span>
              <FaUtensils />
              오늘의 추천 음식
            </span>
            <h2>{MOCK_RECOMMENDATION.name}</h2>
          </div>

          <p>
            {MOCK_RECOMMENDATION.description}
            <br />
            {MOCK_RECOMMENDATION.tip}
          </p>
        </section>

        {/* 친구 공유방 */}
        <ShareRoomSection />

        {/* 주간 캘린더 */}
        <WeeklyCalendar />
      </div>
    </main>
  );
}
