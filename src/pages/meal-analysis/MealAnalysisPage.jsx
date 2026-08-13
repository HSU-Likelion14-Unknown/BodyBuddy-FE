import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AnalysisPreview from './components/AnalysisPreview';
import styles from './MealAnalysisPage.module.scss';

export default function MealAnalysisPage() {
  const { state } = useLocation();
  const [isComplete, setIsComplete] = useState(false);
  const nickname = state?.nickname || '00';

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>
        {nickname}님의 음식 영양소를
        <br />
        살펴볼게요.
      </h1>

      <AnalysisPreview
        image={state?.image}
        description={state?.description}
        isComplete={isComplete}
      />

      <section className={styles.analysisContent}>
        <div className={styles.analysisMessage}>
          <strong>
            {isComplete
              ? `${nickname}님의 식사 분석이 완료됐어요.`
              : `${nickname}님의 식사를 분석 중이에요.`}
          </strong>
          <p>바디버디가 식사의 영양소를 계산하고 있어요.</p>
        </div>

        <div className={styles.progressContent}>
          <div
            className={`${styles.progressBar} ${
              isComplete ? styles.complete : ''
            }`}
            role="progressbar"
          >
            <span onAnimationEnd={() => setIsComplete(true)} />
          </div>

          <div className={styles.progressText}>
            <span>{isComplete ? '분석 완료' : '분석 중...'}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
