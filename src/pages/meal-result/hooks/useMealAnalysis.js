import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isNetworkError } from '@/api/error';
import { getMeal, getRecognitionCandidates } from '@/api/meals';
import {
  getRecentRecommendation,
  isRecommendedFood,
} from '@/utils/recentRecommendation';

// 분석이 일찍 끝나도 이 시간만큼은 분석 화면을 유지한다 (진행 애니메이션 길이와 동일)
const ANALYSIS_MIN_DURATION = 15_000;
const ANALYSIS_MAX_DURATION = 30_000;
const RESULT_TRANSITION_DURATION = 300;

const PENDING_MEAL_STATUSES = [
  'ANALYZING',
  'REANALYZING',
  'RECOGNITION_NOT_READY',
];

function isRecognitionPendingError(error) {
  return [
    'RECOGNITION_NOT_READY',
    'CANDIDATES_NOT_AVAILABLE',
  ].includes(error?.response?.data?.code);
}

// 서버는 엔드포인트마다 인식 결과의 키가 다르다.
// GET /meals/{mealId}                        -> recognizedItems[].foodName
// GET /meals/{mealId}/recognition-candidates -> candidates[].aiFoodName
function toFoods(payload) {
  const items = payload?.candidates ?? payload?.recognizedItems ?? [];

  return items
    .map((item, index) => {
      const name = item.aiFoodName ?? item.foodName;

      return {
        id: `recognized-${item.candidateId ?? item.foodId ?? index}`,
        foodId: item.foodId ?? null,
        name,
        amount: 1,
        unit: '인분',
        source: isRecommendedFood(name, getRecentRecommendation())
          ? 'recommendation'
          : 'recognized',
      };
    })
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
  const [isTakingLonger, setIsTakingLonger] = useState(false);
  const [attemptKey, setAttemptKey] = useState(0);
  const retryLockRef = useRef(false);

  const retryAnalysis = useCallback(() => {
    if (!mealId || pageStatus !== 'timedOut' || retryLockRef.current) return;

    retryLockRef.current = true;
    setIsTakingLonger(false);
    setPageStatus('analyzing');
    setAttemptKey((key) => key + 1);
  }, [mealId, pageStatus]);

  useEffect(() => {
    if (!mealId) {
      navigate('/meals/new', { replace: true });
      return undefined;
    }

    if (Array.isArray(state?.foods)) return undefined;

    const controller = new AbortController();
    const pollDelay = Number(state?.pollAfterMs) || 1000;
    let minimumDurationPassed = false;
    let analyzedFoods = null;
    let attemptFinished = false;
    let minimumTimer;
    let attemptTimer;
    let completionTimer;
    let pollTimer;

    const showResult = () => {
      if (
        !minimumDurationPassed ||
        analyzedFoods === null ||
        attemptFinished ||
        controller.signal.aborted
      ) {
        return;
      }

      attemptFinished = true;
      retryLockRef.current = false;
      window.clearTimeout(attemptTimer);
      window.clearTimeout(pollTimer);
      setPageStatus('completing');

      completionTimer = window.setTimeout(() => {
        if (controller.signal.aborted) return;

        setFoods(analyzedFoods);
        setPageStatus('result');
      }, RESULT_TRANSITION_DURATION);
    };

    const moveToError = (error, recognitionFailure = null) => {
      attemptFinished = true;
      retryLockRef.current = false;
      window.clearTimeout(minimumTimer);
      window.clearTimeout(attemptTimer);
      window.clearTimeout(pollTimer);
      controller.abort();

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
        state: {
          from: '/meals/new',
          source: state?.source,
          manualText: state?.description ?? '',
          recognitionFailure,
        },
      });
    };

    async function pollMeal() {
      if (attemptFinished || controller.signal.aborted) return;

      try {
        const meal = await getMeal(mealId, { signal: controller.signal });

        if (attemptFinished || controller.signal.aborted) return;

        if (PENDING_MEAL_STATUSES.includes(meal.status)) {
          pollTimer = window.setTimeout(pollMeal, pollDelay);
          return;
        }

        if (meal.status === 'FAILED') {
          moveToError(undefined, meal.recognitionFailure ?? null);
          return;
        }

        if (meal.status !== 'REVIEW_REQUIRED') {
          moveToError(undefined, meal.recognitionFailure ?? null);
          return;
        }

        setEatenAt(meal.eatenAt ?? state?.eatenAt);
        const candidates = await getRecognitionCandidates(mealId, {
          signal: controller.signal,
        });

        if (attemptFinished || controller.signal.aborted) return;

        analyzedFoods = toFoods(candidates);
        showResult();
      } catch (error) {
        if (attemptFinished || controller.signal.aborted) return;

        // 아직 인식 결과가 준비되지 않은 상태이므로 오류가 아니라 재폴링 대상이다
        if (isRecognitionPendingError(error)) {
          pollTimer = window.setTimeout(pollMeal, pollDelay);
          return;
        }

        moveToError(error);
      }
    }

    minimumTimer = window.setTimeout(() => {
      if (attemptFinished || controller.signal.aborted) return;

      minimumDurationPassed = true;
      setIsTakingLonger(true);
      showResult();
    }, ANALYSIS_MIN_DURATION);

    attemptTimer = window.setTimeout(() => {
      if (attemptFinished) return;

      attemptFinished = true;
      retryLockRef.current = false;
      controller.abort();
      window.clearTimeout(pollTimer);
      setIsTakingLonger(true);
      setPageStatus('timedOut');
    }, ANALYSIS_MAX_DURATION);

    retryLockRef.current = false;
    pollMeal();

    return () => {
      controller.abort();
      window.clearTimeout(minimumTimer);
      window.clearTimeout(attemptTimer);
      window.clearTimeout(completionTimer);
      window.clearTimeout(pollTimer);
    };
  }, [attemptKey, mealId, navigate, state]);

  return {
    isAnalyzing: pageStatus !== 'result',
    analysisStatus: pageStatus,
    isTakingLonger,
    attemptKey,
    retryAnalysis,
    foods,
    setFoods,
    eatenAt,
  };
}
