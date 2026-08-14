import { useLocation, useNavigate } from 'react-router-dom';
import AnalysisPreview from './components/AnalysisPreview';
import styles from './MealAnalysisPage.module.scss';

export default function MealAnalysisPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const nickname = state?.nickname || '00';

  const handleAnalysisComplete = () => {
    navigate('/meals/result', { replace: true, state });
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>
        {nickname}님의 음식 영양소를
        <br />
        살펴볼게요.
      </h1>

      <AnalysisPreview image={state?.image} description={state?.description} />

      <section className={styles.analysisContent}>
        <div className={styles.analysisMessage}>
          <strong>{nickname}님의 식사를 분석 중이에요.</strong>
          <p>바디버디가 식사의 영양소를 계산하고 있어요.</p>
        </div>

        <div className={styles.progressContent}>
          <div className={styles.progressBar} role="progressbar">
            <span onAnimationEnd={handleAnalysisComplete} />
          </div>

          <div className={styles.progressText}>
            <span>분석 중...</span>
          </div>
        </div>
      </section>
    </main>
  );
}
