import { useNavigate, useLocation } from 'react-router-dom';
import styles from './RecognitionNetworkErrorPage.module.scss';
import networkError from '@/assets/error/network-error.png';

export default function RecognitionNetworkErrorPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleRetry = () => {
    if (state?.from) {
      navigate(state.from, {
        replace: true,
        state: state.requestState,
      });
    } else {
      navigate(-1);
    }
  };

  const handleManualInput = () => {
    navigate('/meals/new', { replace: true, state: { initialMode: 'manual' } });
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <img src={networkError} alt="" className={styles.errorImage} />
        <div className={styles.textGroup}>
          <p className={styles.title}>
            네트워크 상태가
            <br />
            원활하지 않아요.
          </p>
          <p className={styles.subtitle}>
            연결 상태를 확인하신 후 다시 시도해 주세요.
          </p>
        </div>
      </div>
      <button type="button" className={styles.retryBtn} onClick={handleRetry}>
        다시 시도하기
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
