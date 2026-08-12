import { useState } from 'react';
import { MdCameraAlt, MdEdit, MdRestaurant } from 'react-icons/md';
import CameraPanel from './components/CameraPanel';
import ManualInputPanel from './components/ManualInputPanel';
import styles from './MealRecordPage.module.scss';

export default function MealRecordPage() {
  const [mode, setMode] = useState('camera');
  const [manualText, setManualText] = useState('');

  return (
    <main className={styles.container}>
      <section className={styles.suggestion} aria-live="polite">
        <span className={styles.suggestionLabel}>
          <MdRestaurant aria-hidden="true" /> 최근 추천 음식
        </span>
        <strong>지금은 추천 항목이 없어요!</strong>
      </section>

      <div
        className={styles.modeTabs}
        role="tablist"
        aria-label="식사 기록 방식"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'camera'}
          className={`${styles.modeButton} ${
            mode === 'camera' ? styles.active : ''
          }`}
          onClick={() => setMode('camera')}
        >
          <MdCameraAlt aria-hidden="true" />
          카메라
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === 'manual'}
          className={`${styles.modeButton} ${
            mode === 'manual' ? styles.active : ''
          }`}
          onClick={() => setMode('manual')}
        >
          <MdEdit aria-hidden="true" />
          직접 입력
        </button>
      </div>

      {mode === 'camera' ? (
        <CameraPanel />
      ) : (
        <ManualInputPanel value={manualText} onChange={setManualText} />
      )}
    </main>
  );
}
