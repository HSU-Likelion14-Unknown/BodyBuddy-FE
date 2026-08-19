import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isNetworkError } from '@/api/error';
import { getMeal, getRecognitionCandidates } from '@/api/meals';

// 분석이 일찍 끝나도 이 시간만큼은 분석 화면을 유지한다 (진행 애니메이션 길이와 동일)
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

// 식사 분석 상태를 폴링해 인식 결과를 가져온다
export function useMealAnalysis(mealId, state) {
  const navigate = useNavigate();
  const [pageStatus, setPageStatus] = useState(
    Array.isArray(state?.foods) ? 'result' : 'analyzing',
  );
  const [foods, setFoods] = useState(state?.foods ?? []);
  const [eatenAt, setEatenAt] = useState(state?.eatenAt);

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

        // 아직 후보가 준비되지 않은 상태이므로 오류가 아니라 재폴링 대상이다
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

  return {
    isAnalyzing: pageStatus === 'analyzing',
    foods,
    setFoods,
    eatenAt,
  };
}
