import { useState } from 'react';
import { MdCameraAlt, MdEdit, MdRestaurant } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import CameraPanel from './components/CameraPanel';
import ManualInputPanel from './components/ManualInputPanel';
import styles from './MealRecordPage.module.scss';

export default function MealRecordPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [mode, setMode] = useState(state?.initialMode || 'camera');
  const [manualText, setManualText] = useState('');

  const startAnalysis = (meal) => {
    navigate('/meals/analyzing', { state: meal });
  };

  return (
    <main className={styles.container}>
      <section className={styles.suggestion}>
        <span className={styles.suggestionLabel}>
          <MdRestaurant /> 최근 추천 음식
        </span>
        <strong>지금은 추천 항목이 없어요!</strong>
      </section>

      <div className={styles.modeTabs} role="tablist">
        <button
          type="button"
          role="tab"
          className={`${styles.modeButton} ${
            mode === 'camera' ? styles.active : ''
          }`}
          onClick={() => setMode('camera')}
        >
          <MdCameraAlt />
          카메라
        </button>

        <button
          type="button"
          role="tab"
          className={`${styles.modeButton} ${
            mode === 'manual' ? styles.active : ''
          }`}
          onClick={() => setMode('manual')}
        >
          <MdEdit />
          직접 입력
        </button>
      </div>

      {mode === 'camera' ? (
        <CameraPanel onAnalyze={startAnalysis} />
      ) : (
        <ManualInputPanel
          value={manualText}
          onChange={setManualText}
          onAnalyze={startAnalysis}
        />
      )}
    </main>
  );
}
