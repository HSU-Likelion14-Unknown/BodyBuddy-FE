import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '@/api/error';
import { completeMeal, decideRecommendation } from '@/api/meals';

// 추천 선택, 건너뛰기, 기록 완료를 처리하고 캘린더로 이동
export function useRecommendationDecision(recommendationResult, mealId) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const run = async (task, fallbackMessage) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await task();
      navigate('/calendar', { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, fallbackMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDecision = async (decision, ingredient) => {
    if (isSubmitting) return;

    const ingredientId = ingredient?.ingredientId ?? ingredient?.foodId;

    if (
      !recommendationResult?.recommendationId ||
      (decision === 'SELECTED' && !ingredientId)
    ) {
      setErrorMessage('추천 정보를 확인할 수 없어요.');
      return;
    }

    await run(
      () =>
        decideRecommendation(recommendationResult.recommendationId, {
          decision,
          ingredientId: decision === 'SELECTED' ? ingredientId : null,
        }),
      '추천 선택을 저장하지 못했어요.',
    );
  };

  const completeRecord = async () => {
    if (isSubmitting) return;

    if (!mealId) {
      setErrorMessage('식사 기록 정보를 확인할 수 없어요.');
      return;
    }

    await run(() => completeMeal(mealId), '식사 기록을 완료하지 못했어요.');
  };

  return { submitDecision, completeRecord, isSubmitting, errorMessage };
}
