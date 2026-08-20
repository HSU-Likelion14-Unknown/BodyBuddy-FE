import { useNavigate, useLocation } from 'react-router-dom';
import styles from './RecognitionResultErrorPage.module.scss';
import recognitionError from '@/assets/error/recognition-error.png';

export default function RecognitionResultErrorPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isManualInput = state?.source === 'manual';
  const failureMessage = state?.recognitionFailure?.message;

  const handleRetake = () => {
    if (isManualInput) {
      navigate('/meals/new', {
        replace: true,
        state: {
          initialMode: 'manual',
          manualText: state?.manualText ?? '',
        },
      });
      return;
    }

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
              {isManualInput ? '입력한 식사 분석을' : '인식 결과를'}
              <br />
              {isManualInput ? '완료하지 못했어요.' : '불러오지 못 했어요.'}
            </p>
            <p className={styles.subtitle}>
              {isManualInput
                ? failureMessage ||
                  '음식명과 먹은 양을 조금 더 구체적으로 적어 주세요.'
                : '아래 항목을 보시고 다시 시도해 주세요.'}
            </p>
          </div>
        </div>
        {!isManualInput && (
          <ul className={styles.tipList}>
            <li>사진이 너무 어두워요.</li>
            <li>음식이 너무 멀리 있어요.</li>
            <li>사진이 너무 확대됐거나 잘렸어요.</li>
            <li>사진이 많이 흔들렸어요.</li>
          </ul>
        )}
      </div>
      <button type="button" className={styles.retakeBtn} onClick={handleRetake}>
        {isManualInput ? '메뉴 다시 입력하기' : '다시 찍으러 가기'}
      </button>
      {!isManualInput && (
        <button
          type="button"
          className={styles.manualBtn}
          onClick={handleManualInput}
        >
          메뉴 직접 입력하기
        </button>
      )}
    </div>
  );
}
