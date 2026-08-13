import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mealPlaceholder, resultMascot } from '@/assets';
import RecognizedFoodCard from './components/RecognizedFoodCard';
import styles from './MealResultPage.module.scss';

const MOCK_FOODS = [
  { id: 'eel-rice', name: '장어 덮밥', source: 'recognized' },
  { id: 'soup', name: '장국', source: 'recognized' },
];

export default function MealResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [foods, setFoods] = useState(() =>
    Array.isArray(state?.foods) ? state.foods : MOCK_FOODS,
  );

  const addFood = (name) => {
    setFoods((currentFoods) => [
      ...currentFoods,
      { id: `manual-${Date.now()}`, name, source: 'manual' },
    ]);
  };

  const removeFood = (foodId) => {
    setFoods((currentFoods) =>
      currentFoods.filter((food) => food.id !== foodId),
    );
  };

  const isManualMeal = state?.source === 'manual' && state?.description;

  const showRecommendation = () => {
    navigate('/meals/recommendation', {
      replace: true,
      state: { ...state, foods },
    });
  };

  return (
    <main className={styles.container}>
      <img
        className={styles.mascot}
        src={resultMascot}
        alt="인식 결과를 안내하는 바디버디"
      />

      <header className={styles.headerContent}>
        <h1>인식 결과를 확인해 주세요.</h1>
        <p>잘못 인식된 항목은 수정하거나 직접 추가할 수 있어요.</p>
      </header>

      <div className={styles.foodContent}>
        <RecognizedFoodCard
          foods={foods}
          onAdd={addFood}
          onRemove={removeFood}
        />
      </div>

      {isManualMeal ? (
        <section className={styles.descriptionContent}>
          <span>직접 입력한 식사</span>
          <p>{state.description}</p>
        </section>
      ) : (
        <img
          className={styles.mealImage}
          src={state?.image || mealPlaceholder}
          alt="인식한 식사"
        />
      )}

      <div className={styles.actionContent}>
        <button
          type="button"
          className={styles.recommendButton}
          disabled={state?.recommendationAccepted}
          onClick={showRecommendation}
        >
          {state?.recommendationAccepted ? '추천 실천 완료' : '추천 받을래요'}
        </button>
        <button
          type="button"
          className={styles.recordButton}
          title="저장 API 연결 후 사용할 수 있어요"
          disabled
        >
          {state?.recommendationAccepted
            ? '이대로 기록할래요'
            : '추천 없이 기록만 할게요'}
        </button>
      </div>
    </main>
  );
}
