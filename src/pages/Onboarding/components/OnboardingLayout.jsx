import { useNavigate } from 'react-router-dom';
import styles from './OnboardingLayout.module.scss';
import { iconBack } from '@/assets';

const TOTAL_STEPS = 3;

export default function OnboardingLayout({
  step,
  image,
  title,
  subtitle,
  isNextEnabled,
  onNext,
  onBack,
  children,
}) {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.progressSection}>
        <span className={styles.progressText}>
          {step} / {TOTAL_STEPS}
        </span>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <button
        className={styles.backBtn}
        onClick={onBack ?? (() => navigate(-1))}
      >
        <img src={iconBack} alt="뒤로가기" />
      </button>

      <div className={styles.characterWrap}>
        <img src={image} alt="" className={styles.character} />
      </div>

      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

      <div
        className={`${styles.content} ${subtitle ? styles.contentWithSubtitle : ''}`}
      >
        {children}
      </div>

      <button
        type="button"
        className={`${styles.nextBtn} ${isNextEnabled ? styles.nextBtnActive : ''}`}
        onClick={onNext}
        disabled={!isNextEnabled}
      >
        다음으로
      </button>
    </div>
  );
}
