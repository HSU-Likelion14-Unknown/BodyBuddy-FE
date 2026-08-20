import { useLocation } from 'react-router-dom';
import { useMyNickname } from '@/hooks/useMyNickname';
import AnalysisPreview from './components/AnalysisPreview';
import styles from './MealAnalysisPage.module.scss';

export default function MealAnalysisPage({
  status = 'analyzing',
  isTakingLonger = false,
  attemptKey = 0,
  onRetry,
  onManualInput,
}) {
  const { state } = useLocation();
  const nickname = useMyNickname();
  const isCompleting = status === 'completing';
  const isTimedOut = status === 'timedOut';
  const statusTitle = isTimedOut
    ? '분석 결과를 아직 확인하지 못했어요.'
    : isCompleting
      ? '분석이 완료됐어요.'
      : isTakingLonger
        ? '조금 더 걸리고 있어요.'
        : `${nickname}님의 식사를 분석 중이에요.`;
  const statusDescription = isTimedOut
    ? '같은 식사 기록을 다시 확인하거나 직접 입력할 수 있어요.'
    : isCompleting
      ? '결과 화면으로 이동하고 있어요.'
      : isTakingLonger
        ? '분석은 계속 진행 중이에요. 잠시만 더 기다려 주세요.'
        : '바디버디가 식사의 영양소를 계산하고 있어요.';
  const progressText = isTimedOut
    ? '분석 결과 확인 대기'
    : isCompleting
      ? '분석 완료'
      : isTakingLonger
        ? '예상보다 오래 걸리는 중'
        : '분석 중';

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>
        {nickname}님의 음식 영양소를
        <br />
        살펴볼게요.
      </h1>

      <AnalysisPreview image={state?.image} description={state?.description} />

      <section className={styles.analysisContent}>
        <div className={styles.analysisMessage} aria-live="polite">
          <strong>{statusTitle}</strong>
          <p>{statusDescription}</p>
        </div>

        <div className={styles.progressContent}>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-label="식사 분석 진행 상태"
            aria-valuetext={progressText}
          >
            <span
              key={attemptKey}
              className={isCompleting ? styles.progressComplete : ''}
            />
          </div>

          <div className={styles.progressText}>
            <span>{progressText}</span>
          </div>
        </div>

        {isTimedOut && (
          <div className={styles.timeoutActions}>
            <button type="button" onClick={onRetry}>
              같은 식사 다시 확인하기
            </button>
            <button type="button" onClick={onManualInput}>
              메뉴 직접 입력하기
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
