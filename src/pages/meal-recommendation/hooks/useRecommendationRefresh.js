import { useState } from 'react';
import { getApiErrorMessage } from '@/api/error';
import { refreshRecommendation } from '@/api/meals';

const MAX_REFRESH_COUNT = 3;

// 새로고침하면 서버가 기존 재료를 겹치지 않는 새 재료로 교체
export function useRecommendationRefresh(initialRecommendation) {
  const [recommendation, setRecommendation] = useState(initialRecommendation);
  const [usedCount, setUsedCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const remainingCount = Math.max(MAX_REFRESH_COUNT - usedCount, 0);

  const refresh = async () => {
    if (isRefreshing || remainingCount <= 0) return false;
    if (!recommendation?.recommendationId) return false;

    setIsRefreshing(true);
    setErrorMessage('');

    try {
      const next = await refreshRecommendation(recommendation.recommendationId);

      setRecommendation(next);
      setUsedCount((count) => count + 1);
      return true;
    } catch (error) {
      // 겹치지 않는 새 재료가 더 없으면 남은 횟수와 무관하게 소진
      if (error.response?.data?.code === 'RECOMMENDATION_REFRESH_EXHAUSTED') {
        setUsedCount(MAX_REFRESH_COUNT);
      }

      setErrorMessage(
        getApiErrorMessage(error, '다른 추천을 불러오지 못했어요.'),
      );
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    recommendation,
    remainingCount,
    isRefreshing,
    errorMessage,
    refresh,
  };
}
