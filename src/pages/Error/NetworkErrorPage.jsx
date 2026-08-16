import { useNavigate } from 'react-router-dom';
import styles from './NetworkErrorPage.module.scss';
import networkError from '@/assets/error/network-error.png';

export default function NetworkErrorPage() {
  const navigate = useNavigate();

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
      <button
        type="button"
        className={styles.retryBtn}
        onClick={() => navigate(-1)}
      >
        다시 시도하기
      </button>
    </div>
  );
}
