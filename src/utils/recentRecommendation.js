const STORAGE_KEY = 'bodybuddy.recentRecommendation';
// 최근 추천 결정은 24시간만 유효
const VALID_DURATION = 24 * 60 * 60 * 1000;

// 선택 결과를 로컬에 보관
export function getRecentRecommendation() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');

    if (!stored?.ingredientName) return null;

    const decidedAt = Date.parse(stored.decidedAt);

    if (!Number.isFinite(decidedAt)) return null;
    if (Date.now() - decidedAt > VALID_DURATION) return null;

    return stored;
  } catch {
    return null;
  }
}

export function saveRecentRecommendation({ ingredientName, dishNames = [] }) {
  if (!ingredientName) return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ingredientName,
      dishNames,
      decidedAt: new Date().toISOString(),
    }),
  );
}

export function clearRecentRecommendation() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isRecommendedFood(foodName, recommendation) {
  if (!foodName || !recommendation?.ingredientName) return false;

  const name = foodName.replace(/\s/g, '');
  const ingredient = recommendation.ingredientName.replace(/\s/g, '');
  const dishes = (recommendation.dishNames ?? []).map((dish) =>
    dish.replace(/\s/g, ''),
  );

  return name.includes(ingredient) || dishes.includes(name);
}
