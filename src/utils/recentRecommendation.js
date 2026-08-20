const STORAGE_KEY = 'bodybuddy.recentRecommendation';
const DAILY_FALLBACK_STORAGE_KEY = 'bodybuddy.dailyFallbackRecommendation';
// 최근 추천 결정은 24시간만 유효
const VALID_DURATION = 24 * 60 * 60 * 1000;

const DAILY_FALLBACK_RECOMMENDATIONS = [
  {
    ingredientName: '브로콜리',
    reason: '볶음이나 샐러드로 간편하게 곁들이기 좋은 식재료예요.',
    dishNames: ['브로콜리 볶음', '브로콜리 샐러드'],
  },
  {
    ingredientName: '단호박',
    reason: '부드럽게 익혀 한 끼에 곁들이기 좋은 식재료예요.',
    dishNames: ['단호박찜', '단호박 샐러드'],
  },
  {
    ingredientName: '버섯',
    reason: '볶음이나 국에 다양하게 활용하기 좋은 식재료예요.',
    dishNames: ['버섯볶음', '버섯국'],
  },
  {
    ingredientName: '토마토',
    reason: '샐러드나 곁들임 요리로 간편하게 활용할 수 있어요.',
    dishNames: ['토마토 샐러드', '구운 토마토'],
  },
  {
    ingredientName: '시금치',
    reason: '나물이나 국으로 가볍게 곁들이기 좋은 식재료예요.',
    dishNames: ['시금치나물', '시금치국'],
  },
];

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 저장소를 사용할 수 없어도 추천 화면은 계속 사용
  }
}

function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // 저장소를 사용할 수 없어도 추천 화면은 계속 사용
  }
}

function normalizeRecommendation(recommendation) {
  return {
    ...recommendation,
    reason:
      typeof recommendation?.reason === 'string' ? recommendation.reason : '',
    dishNames: Array.isArray(recommendation?.dishNames)
      ? recommendation.dishNames.filter((dish) => typeof dish === 'string')
      : [],
  };
}

function getKoreaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .formatToParts(date)
    .reduce((result, part) => ({ ...result, [part.type]: part.value }), {});

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getDailyRecommendationIndex(dateKey) {
  return [...dateKey].reduce((sum, character) => sum + character.charCodeAt(0), 0)
    % DAILY_FALLBACK_RECOMMENDATIONS.length;
}

// 선택 결과를 로컬에 보관
export function getRecentRecommendation() {
  try {
    const stored = JSON.parse(readStorage(STORAGE_KEY) || 'null');

    if (!stored?.ingredientName) return null;

    const decidedAt = Date.parse(stored.decidedAt);

    if (!Number.isFinite(decidedAt)) return null;
    if (Date.now() - decidedAt > VALID_DURATION) {
      clearRecentRecommendation();
      return null;
    }

    return normalizeRecommendation(stored);
  } catch {
    return null;
  }
}

export function saveRecentRecommendation({
  ingredientName,
  reason = '',
  dishNames = [],
}) {
  if (!ingredientName) return;

  writeStorage(
    STORAGE_KEY,
    JSON.stringify({
      ingredientName,
      reason,
      dishNames,
      decidedAt: new Date().toISOString(),
    }),
  );
}

export function clearRecentRecommendation() {
  removeStorage(STORAGE_KEY);
}

export function getHomeRecommendation() {
  const recentRecommendation = getRecentRecommendation();

  if (recentRecommendation) {
    return { ...recentRecommendation, isFallback: false };
  }

  const dateKey = getKoreaDateKey();

  try {
    const stored = JSON.parse(
      readStorage(DAILY_FALLBACK_STORAGE_KEY) || 'null',
    );

    if (stored?.dateKey === dateKey && stored?.ingredientName) {
      return { ...normalizeRecommendation(stored), isFallback: true };
    }
  } catch {
    removeStorage(DAILY_FALLBACK_STORAGE_KEY);
  }

  const recommendation = {
    ...DAILY_FALLBACK_RECOMMENDATIONS[getDailyRecommendationIndex(dateKey)],
    dateKey,
  };

  writeStorage(
    DAILY_FALLBACK_STORAGE_KEY,
    JSON.stringify(recommendation),
  );

  return { ...recommendation, isFallback: true };
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
