// 서버 영양소 enum. 화면 표기 대응
const NUTRIENTS = {
  PROTEIN: { key: 'proteinG', name: '단백질', unit: 'g' },
  FIBER: { key: 'fiberG', name: '식이섬유', unit: 'g' },
  CALCIUM: { key: 'calciumMg', name: '칼슘', unit: 'mg' },
  IRON: { key: 'ironMg', name: '철분', unit: 'mg' },
  POTASSIUM: { key: 'potassiumMg', name: '칼륨', unit: 'mg' },
  VITAMIN_A: { key: 'vitaminAMcgRae', name: '비타민 A', unit: 'mcg' },
  VITAMIN_C: { key: 'vitaminCMg', name: '비타민 C', unit: 'mg' },
};

export function formatAmount(value) {
  return Number(Number(value).toFixed(1));
}

function toNumberOrNull(value) {
  if (value == null || value === '') return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

// 부족한 영양소를 앞에 두고 현재 식사 섭취량과 하루 목표를 최대 3개까지 표시
export function getNutrientSummary(recommendation, nutritionSummary) {
  const daily = recommendation?.dailyNutrition ?? {};
  const gap = recommendation?.nutrientGap ?? {};
  const currentMeal = nutritionSummary ?? {};
  const fields = [
    NUTRIENTS[recommendation?.targetNutrient],
    NUTRIENTS.PROTEIN,
    NUTRIENTS.FIBER,
    NUTRIENTS.CALCIUM,
  ]
    .filter(Boolean)
    .filter((field, index, list) => list.indexOf(field) === index)
    .slice(0, 3);

  return fields.map((field) => ({
    ...field,
    current: toNumberOrNull(currentMeal[field.key]),
    target:
      (Number(daily[field.key]) || 0) + (Number(gap[field.key]) || 0) || 1,
  }));
}

// nutrientCoverages: [{ nutrient: 'IRON', coveragePercent: 92 }]
function toNutrients(ingredient) {
  const source = ingredient?.nutrientCoverages;

  if (!Array.isArray(source)) return [];

  return source
    .map((item) => ({
      name: NUTRIENTS[item.nutrient]?.name ?? item.nutrient,
      percent: Math.round(Number(item.coveragePercent)),
    }))
    .filter((item) => item.name && Number.isFinite(item.percent))
    .slice(0, 3);
}

// 서버 추천 재료를 카드 표시 형태로 변환
export function toCard(ingredient, targetNutrient) {
  return {
    name: ingredient.ingredientName,
    tags: [NUTRIENTS[targetNutrient]?.name].filter(Boolean),
    nutrients: toNutrients(ingredient),
    description: ingredient.reason,
    recipes: ingredient.dishes?.map((dish) => dish.dishName) ?? [],
  };
}
