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
import { useMyNickname } from '@/hooks/useMyNickname';
import { getHomeRecommendation } from '@/utils/recentRecommendation';
import ShareRoomSection from './components/ShareRoomSection';
import WeeklyCalendar from './components/WeeklyCalendar';
import styles from './HomePage.module.scss';

export default function HomePage() {
  const navigate = useNavigate();
  const nickname = useMyNickname();
  const recommendation = getHomeRecommendation();
  const recommendationReason =
    recommendation.reason || '최근 식사 기록을 바탕으로 추천한 재료예요.';

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
          <p>바디버디가 {nickname}님의 영양소를 채워드릴게요!</p>

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
            <h2>{recommendation.ingredientName}</h2>
          </div>

          <p>
            {recommendationReason}
            <br />
            다음 끼니에 추가하면 밸런스가 좋아요.
          </p>
        </section>

        {/* 친구 공유방 */}
        <ShareRoomSection nickname={nickname} />

        {/* 주간 캘린더 */}
        <WeeklyCalendar />
      </div>
    </main>
  );
}
