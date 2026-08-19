import { useState } from 'react';
import { MdCameraAlt, MdEdit, MdRestaurant } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '@/api/error';
import { createImageMeal, createTextMeal } from '@/api/meals';
import { getRecentRecommendation } from '@/utils/recentRecommendation';
import CameraPanel from './components/CameraPanel';
import ManualInputPanel from './components/ManualInputPanel';
import styles from './MealRecordPage.module.scss';

async function dataUrlToFile(dataUrl) {
  if (dataUrl instanceof File) return dataUrl;

  const blob = await fetch(dataUrl).then((response) => response.blob());
  const extension = blob.type === 'image/png' ? 'png' : 'jpg';

  return new File([blob], `meal.${extension}`, {
    type: blob.type || 'image/jpeg',
    lastModified: 0,
  });
}

export default function MealRecordPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [mode, setMode] = useState(state?.initialMode || 'camera');
  const [manualText, setManualText] = useState(state?.manualText || '');
  const [errorMessage, setErrorMessage] = useState('');
  const recentRecommendation = getRecentRecommendation();

  const startAnalysis = async (meal) => {
    setErrorMessage('');

    const eatenAt = new Date().toISOString();

    try {
      const result =
        meal.source === 'manual'
          ? await createTextMeal({ text: meal.description, eatenAt })
          : await createImageMeal(await dataUrlToFile(meal.image), eatenAt);

      navigate('/meals/result', {
        state: { ...meal, ...result, eatenAt },
      });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          '식사 분석을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.',
        ),
      );
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.suggestion}>
        <span className={styles.suggestionLabel}>
          <MdRestaurant /> 최근 추천 음식
        </span>
        <strong>
          {recentRecommendation
            ? recentRecommendation.ingredientName
            : '지금은 추천 항목이 없어요!'}
        </strong>
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

      {errorMessage && (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}
    </main>
  );
}
