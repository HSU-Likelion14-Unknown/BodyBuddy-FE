import styles from './CameraPermissionDialog.module.scss';

export default function CameraPermissionDialog({ onRetry, onCancel }) {
  return (
    <div className={styles.dialogOverlay}>
      <div
        className={styles.permissionDialog}
        role="dialog"
      >
        <div className={styles.dialogContent}>
          <h2>
            현재 <strong>‘바디버디’</strong>에서 카메라 사용에
            <br />
            대한 접근 권한이 없습니다.
          </h2>
          <p>
            아래 버튼을 눌러 카메라 접근 권한을
            <br />다시 요청해 주세요.
          </p>
        </div>
        <div className={styles.dialogActions}>
          <button
            type="button"
            className={styles.retryButton}
            onClick={onRetry}
          >
            카메라 권한 다시 요청
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
