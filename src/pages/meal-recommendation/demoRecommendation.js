// 영상 촬영용 임시 fallback. 백엔드 추천이 복구되면 false로 전환한다.
export const DEMO_RECOMMENDATION_FALLBACK_ENABLED = true;

const TARGET_LABELS = {
  PROTEIN: '단백질',
  FIBER: '식이섬유',
  CALCIUM: '칼슘',
  IRON: '철분',
  POTASSIUM: '칼륨',
  VITAMIN_A: '비타민 A',
  VITAMIN_C: '비타민 C',
};

const DEMO_INGREDIENT_SETS = [
  [
    {
      name: '당근',
      coveragePercent: 47,
      supportingNutrients: [
        { nutrient: 'VITAMIN_A', coveragePercent: 47 },
        { nutrient: 'FIBER', coveragePercent: 18 },
      ],
      dishes: ['당근라페', '당근구이', '당근볶음'],
    },
    {
      name: '시금치',
      coveragePercent: 54,
      supportingNutrients: [
        { nutrient: 'VITAMIN_A', coveragePercent: 54 },
        { nutrient: 'IRON', coveragePercent: 31 },
      ],
      dishes: ['시금치나물', '시금치국', '시금치볶음'],
    },
  ],
  [
    {
      name: '단호박',
      coveragePercent: 42,
      supportingNutrients: [
        { nutrient: 'VITAMIN_A', coveragePercent: 42 },
        { nutrient: 'FIBER', coveragePercent: 21 },
      ],
      dishes: ['단호박찜', '단호박 샐러드', '단호박수프'],
    },
    {
      name: '케일',
      coveragePercent: 38,
      supportingNutrients: [
        { nutrient: 'VITAMIN_A', coveragePercent: 38 },
        { nutrient: 'CALCIUM', coveragePercent: 24 },
      ],
      dishes: ['케일 샐러드', '케일볶음', '케일주스'],
    },
  ],
  [
    {
      name: '브로콜리',
      coveragePercent: 36,
      supportingNutrients: [
        { nutrient: 'VITAMIN_C', coveragePercent: 65 },
        { nutrient: 'FIBER', coveragePercent: 20 },
      ],
      dishes: ['브로콜리 볶음', '브로콜리 샐러드', '브로콜리 수프'],
    },
    {
      name: '파프리카',
      coveragePercent: 34,
      supportingNutrients: [
        { nutrient: 'VITAMIN_C', coveragePercent: 72 },
        { nutrient: 'FIBER', coveragePercent: 16 },
      ],
      dishes: ['파프리카 볶음', '파프리카 샐러드', '구운 파프리카'],
    },
  ],
  [
    {
      name: '토마토',
      coveragePercent: 31,
      supportingNutrients: [
        { nutrient: 'VITAMIN_C', coveragePercent: 28 },
        { nutrient: 'POTASSIUM', coveragePercent: 19 },
      ],
      dishes: ['토마토 샐러드', '구운 토마토', '토마토 달걀볶음'],
    },
    {
      name: '달걀',
      coveragePercent: 29,
      supportingNutrients: [
        { nutrient: 'PROTEIN', coveragePercent: 24 },
        { nutrient: 'IRON', coveragePercent: 18 },
      ],
      dishes: ['달걀찜', '달걀말이', '삶은 달걀 샐러드'],
    },
  ],
];

function nutrientCoverages(ingredient, targetNutrient) {
  const coverages = [
    {
      nutrient: targetNutrient,
      coveragePercent: ingredient.coveragePercent,
    },
    ...ingredient.supportingNutrients,
  ];

  return coverages.filter(
    (coverage, index, list) =>
      coverage.nutrient &&
      list.findIndex((item) => item.nutrient === coverage.nutrient) === index,
  );
}

function buildDemoRecommendation(source, setIndex) {
  const normalizedIndex = setIndex % DEMO_INGREDIENT_SETS.length;
  const targetNutrient = source?.targetNutrient ?? 'VITAMIN_A';
  const targetLabel = TARGET_LABELS[targetNutrient] ?? '부족한 영양소';
  const sourceRecommendationId =
    source?.demoSourceRecommendationId ??
    source?.recommendationId ??
    'fallback';

  return {
    ...source,
    recommendationId: `demo-${sourceRecommendationId}`,
    status: 'CREATED',
    noRecommendationReason: null,
    isDemoRecommendation: true,
    demoSourceRecommendationId: sourceRecommendationId,
    demoSetIndex: normalizedIndex,
    ingredients: DEMO_INGREDIENT_SETS[normalizedIndex].map(
      (ingredient, ingredientIndex) => ({
        ingredientId: `demo-${normalizedIndex}-${ingredientIndex}`,
        foodId: null,
        ingredientName: ingredient.name,
        rank: ingredientIndex + 1,
        reason: `${ingredient.name}은 ${targetLabel}을 보충하면서 다음 끼니에 간편하게 곁들이기 좋은 식재료예요.`,
        nutrientCoverages: nutrientCoverages(ingredient, targetNutrient),
        dishes: ingredient.dishes.map((dishName, dishIndex) => ({
          dishId: `demo-${normalizedIndex}-${ingredientIndex}-${dishIndex}`,
          foodId: null,
          dishName,
          rank: dishIndex + 1,
        })),
      }),
    ),
  };
}

export function applyDemoRecommendationFallback(recommendation) {
  const shouldFallback =
    DEMO_RECOMMENDATION_FALLBACK_ENABLED &&
    recommendation?.status === 'NO_CANDIDATE' &&
    recommendation?.noRecommendationReason === 'NO_SAFE_CANDIDATE';

  return shouldFallback
    ? buildDemoRecommendation(recommendation, 0)
    : recommendation;
}

export function getNextDemoRecommendation(recommendation) {
  return buildDemoRecommendation(
    recommendation,
    (recommendation?.demoSetIndex ?? 0) + 1,
  );
}
