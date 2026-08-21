import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '@/api/error';
import {
  completeMeal,
  confirmMeal,
  createMealRecommendation,
} from '@/api/meals';
import {
  getRecentRecommendation,
  isRecommendedFood,
} from '@/utils/recentRecommendation';
import { mealPlaceholder, resultMascot } from '@/assets';
import MealAnalysisPage from '../meal-analysis/MealAnalysisPage';
import { applyDemoRecommendationFallback } from '../meal-recommendation/demoRecommendation';
import RecognizedFoodCard from './components/RecognizedFoodCard';
import { useMealAnalysis } from './hooks/useMealAnalysis';
import styles from './MealResultPage.module.scss';

function toMealItems(foods) {
  return foods.map((food) => ({
    foodId: food.foodId ?? null,
    foodName: food.name,
    amount: food.amount ?? 1,
    unit: food.unit ?? '인분',
  }));
}

export default function MealResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const mealId = state?.mealId;
  const {
    isAnalyzing,
    analysisStatus,
    isTakingLonger,
    attemptKey,
    retryAnalysis,
    foods,
    setFoods,
    eatenAt,
  } = useMealAnalysis(mealId, state);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [nutritionSummary, setNutritionSummary] = useState(null);
  const [pendingAction, setPendingAction] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (isAnalyzing) {
    return (
      <MealAnalysisPage
        status={analysisStatus}
        isTakingLonger={isTakingLonger}
        attemptKey={attemptKey}
        onRetry={retryAnalysis}
        onManualInput={() =>
          navigate('/meals/new', {
            replace: true,
            state: {
              initialMode: 'manual',
              manualText: state?.description ?? '',
            },
          })
        }
      />
    );
  }

  const addFood = (name) => {
    setFoods((currentFoods) => [
      ...currentFoods,
      {
        id: `manual-${Date.now()}`,
        foodId: null,
        name,
        amount: 1,
        unit: '인분',
        source: isRecommendedFood(name, getRecentRecommendation())
          ? 'recommendation'
          : 'manual',
      },
    ]);
  };

  const removeFood = (foodId) => {
    setFoods((currentFoods) =>
      currentFoods.filter((food) => food.id !== foodId),
    );
  };

  const submitMeal = async (action) => {
    if (!mealId || pendingAction || !foods.length) return;

    setPendingAction(action);
    setErrorMessage('');

    try {
      let currentNutritionSummary = nutritionSummary;

      if (!isConfirmed) {
        const confirmedMeal = await confirmMeal(mealId, {
          items: toMealItems(foods),
          eatenAt: eatenAt ?? new Date().toISOString(),
        });

        currentNutritionSummary = confirmedMeal?.nutritionSummary ?? null;
        setNutritionSummary(currentNutritionSummary);
        setIsConfirmed(true);
      }

      if (action === 'recommendation') {
        const recommendationResponse = await createMealRecommendation(mealId);
        const recommendation = applyDemoRecommendationFallback(
          recommendationResponse,
        );
        navigate('/meals/recommendation', {
          replace: true,
          state: {
            ...state,
            foods,
            nutritionSummary: currentNutritionSummary,
            recommendation,
          },
        });
      } else {
        await completeMeal(mealId);
        navigate('/calendar', { replace: true });
      }
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          '식사 기록을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.',
        ),
      );
    } finally {
      setPendingAction('');
    }
  };

  const isManualMeal = state?.source === 'manual' && state?.description;

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
          disabled={isConfirmed}
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
        {errorMessage && (
          <p className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        )}
        <button
          type="button"
          className={styles.recommendButton}
          disabled={Boolean(pendingAction) || !foods.length}
          onClick={() => submitMeal('recommendation')}
        >
          {pendingAction === 'recommendation' ? (
            <>
              추천을 준비하고 있어요
              <span className={styles.loadingDots}>
                <span />
                <span />
                <span />
              </span>
            </>
          ) : (
            '추천 받을래요'
          )}
        </button>
        <button
          type="button"
          className={styles.recordButton}
          disabled={Boolean(pendingAction) || !foods.length}
          onClick={() => submitMeal('complete')}
        >
          {pendingAction === 'complete' ? (
            <>
              기록하고 있어요
              <span className={styles.loadingDots}>
                <span />
                <span />
                <span />
              </span>
            </>
          ) : (
            '추천 없이 기록만 할게요'
          )}
        </button>
      </div>
    </main>
  );
}
