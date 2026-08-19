import { useEffect } from 'react';
import styles from './Toast.module.scss';

// 3초 동안 토스트 띄움
export default function Toast({ message, visible, onHide, duration = 3000 }) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onHide]);

  return (
    <div className={`${styles.toast} ${visible ? styles.visible : ''}`}>
      {message}
    </div>
  );
}
