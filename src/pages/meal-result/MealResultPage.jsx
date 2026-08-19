import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage, isNetworkError } from '@/api/error';
import {
  completeMeal,
  confirmMeal,
  createMealRecommendation,
  getMeal,
  getRecognitionCandidates,
} from '@/api/meals';
import { mealPlaceholder, resultMascot } from '@/assets';
import MealAnalysisPage from '../meal-analysis/MealAnalysisPage';
import RecognizedFoodCard from './components/RecognizedFoodCard';
import styles from './MealResultPage.module.scss';

const ANALYSIS_MIN_DURATION = 12_000;

// 서버는 엔드포인트마다 인식 결과의 키가 다르다.
// GET /meals/{mealId}                        -> recognizedItems[].foodName
// GET /meals/{mealId}/recognition-candidates -> candidates[].aiFoodName
function toFoods(payload) {
  const items = payload?.candidates ?? payload?.recognizedItems ?? [];

  return items
    .map((item, index) => ({
      id: `recognized-${item.candidateId ?? item.foodId ?? index}`,
      foodId: item.foodId ?? null,
      name: item.aiFoodName ?? item.foodName,
      amount: 1,
      unit: '인분',
      source: 'recognized',
    }))
    .filter((food) => food.name);
}

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
  const [pageStatus, setPageStatus] = useState(
    Array.isArray(state?.foods) ? 'result' : 'analyzing',
  );
  const [foods, setFoods] = useState(state?.foods ?? []);
  const [eatenAt, setEatenAt] = useState(state?.eatenAt);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!mealId) {
      navigate('/meals/new', { replace: true });
      return undefined;
    }

    if (pageStatus === 'result') return undefined;

    const controller = new AbortController();
    const pollDelay = Number(state?.pollAfterMs) || 1000;
    let minimumDurationPassed = false;
    let analyzedFoods = null;
    let minimumTimer;
    let pollTimer;

    const showResult = () => {
      if (!minimumDurationPassed || analyzedFoods === null) return;

      setFoods(analyzedFoods);
      setPageStatus('result');
    };

    const moveToError = (error) => {
      if (isNetworkError(error)) {
        navigate('/error/recognition-network', {
          replace: true,
          state: {
            from: '/meals/result',
            requestState: state,
          },
        });
        return;
      }

      navigate('/error/recognition-result', {
        replace: true,
        state: { from: '/meals/new' },
      });
    };

    async function pollMeal() {
      try {
        const meal = await getMeal(mealId, { signal: controller.signal });

        if (['ANALYZING', 'REANALYZING'].includes(meal.status)) {
          pollTimer = window.setTimeout(pollMeal, pollDelay);
          return;
        }

        if (meal.status !== 'REVIEW_REQUIRED') {
          moveToError();
          return;
        }

        setEatenAt(meal.eatenAt ?? state?.eatenAt);
        const candidates = await getRecognitionCandidates(mealId, {
          signal: controller.signal,
        });
        analyzedFoods = toFoods(candidates);
        showResult();
      } catch (error) {
        if (controller.signal.aborted) return;

        if (error.response?.data?.code === 'CANDIDATES_NOT_AVAILABLE') {
          pollTimer = window.setTimeout(pollMeal, pollDelay);
          return;
        }

        moveToError(error);
      }
    }

    minimumTimer = window.setTimeout(() => {
      minimumDurationPassed = true;
      showResult();
    }, ANALYSIS_MIN_DURATION);
    pollMeal();

    return () => {
      controller.abort();
      window.clearTimeout(minimumTimer);
      window.clearTimeout(pollTimer);
    };
  }, [mealId, navigate, pageStatus, state]);

  if (pageStatus === 'analyzing') {
    return <MealAnalysisPage />;
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
        source: 'manual',
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
      if (!isConfirmed) {
        await confirmMeal(mealId, {
          items: toMealItems(foods),
          eatenAt: eatenAt ?? new Date().toISOString(),
        });
        setIsConfirmed(true);
      }

      if (action === 'recommendation') {
        const recommendation = await createMealRecommendation(mealId);
        navigate('/meals/recommendation', {
          replace: true,
          state: { ...state, foods, recommendation },
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
          {pendingAction === 'recommendation'
            ? '추천을 준비하고 있어요...'
            : '추천 받을래요'}
        </button>
        <button
          type="button"
          className={styles.recordButton}
          disabled={Boolean(pendingAction) || !foods.length}
          onClick={() => submitMeal('complete')}
        >
          {pendingAction === 'complete'
            ? '기록하고 있어요...'
            : '추천 없이 기록만 할게요'}
        </button>
      </div>
    </main>
  );
}
