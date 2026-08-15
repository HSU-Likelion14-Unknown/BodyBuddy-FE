import { useNavigate, useLocation } from 'react-router-dom';
import styles from './RecognitionResultErrorPage.module.scss';
import recognitionError from '@/assets/error/recognition-error.png';

export default function RecognitionResultErrorPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleRetake = () => {
    navigate(state?.from || '/meals/new', { replace: true });
  };

  const handleManualInput = () => {
    navigate('/meals/new', { replace: true, state: { initialMode: 'manual' } });
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.imageAndText}>
          <img src={recognitionError} alt="" className={styles.errorImage} />
          <div className={styles.textGroup}>
            <p className={styles.title}>
              인식 결과를
              <br />
              불러오지 못 했어요.
            </p>
            <p className={styles.subtitle}>
              아래 항목을 보시고 다시 시도해 주세요.
            </p>
          </div>
        </div>
        <ul className={styles.tipList}>
          <li>사진이 너무 어두워요.</li>
          <li>음식이 너무 멀리 있어요.</li>
          <li>사진이 너무 확대됐거나 잘렸어요.</li>
          <li>사진이 많이 흔들렸어요.</li>
        </ul>
      </div>
      <button type="button" className={styles.retakeBtn} onClick={handleRetake}>
        다시 찍으러 가기
      </button>
      <button
        type="button"
        className={styles.manualBtn}
        onClick={handleManualInput}
      >
        메뉴 직접 입력하기
      </button>
    </div>
  );
}
