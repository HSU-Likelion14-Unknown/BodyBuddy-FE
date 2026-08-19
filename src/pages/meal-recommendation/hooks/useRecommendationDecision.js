import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '@/api/error';
import { completeMeal, decideRecommendation } from '@/api/meals';
import { saveRecentRecommendation } from '@/utils/recentRecommendation';

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
      // 이미 결정이 저장된 요청은 재시도로 보고 캘린더로 이동
      if (error.response?.data?.code === 'RECOMMENDATION_ALREADY_DECIDED') {
        navigate('/calendar', { replace: true });
        return;
      }

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

    await run(async () => {
      await decideRecommendation(recommendationResult.recommendationId, {
        decision,
        ingredientId: decision === 'SELECTED' ? ingredientId : null,
      });

      // 다음 끼니 기록 화면에서 안내하려고 선택한 재료 보관
      if (decision === 'SELECTED') {
        saveRecentRecommendation({
          ingredientName: ingredient.ingredientName,
          dishNames: ingredient.dishes?.map((dish) => dish.dishName) ?? [],
        });
      }
    }, '추천 선택을 저장하지 못했어요.');
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
