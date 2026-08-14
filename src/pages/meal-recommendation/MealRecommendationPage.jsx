import { useState } from 'react';
import { MdArrowForward } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { perfectDecoration, perfectResult } from '@/assets';
import RecommendationCard from './components/RecommendationCard';
import styles from './MealRecommendationPage.module.scss';

const MOCK_FOODS = [
  { id: 'eel-rice', name: '장어 덮밥', source: 'recognized' },
  { id: 'soup', name: '장국', source: 'recognized' },
];

const MOCK_MEAL_ANALYSIS = {
  calories: 450,
  nutrients: [
    { name: '단백질', current: 48, target: 65 },
    { name: '탄수화물', current: 284, target: 300 },
    { name: '지방', current: 51, target: 65 },
  ],
};

const MOCK_PERFECT_FOODS = [
  { id: 'milk', name: '우유', source: 'recognized' },
  { id: 'peanut-butter', name: '땅콩버터', source: 'recognized' },
  { id: 'apple', name: '사과', source: 'recognized' },
];

const MOCK_PERFECT_MEAL_ANALYSIS = {
  calories: 380,
  nutrients: [
    { name: '단백질', current: 35, target: 65 },
    { name: '탄수화물', current: 15, target: 300 },
    { name: '지방', current: 22, target: 65 },
  ],
};

const MOCK_RECOMMENDATIONS = [
  {
    id: 'grilled-salmon',
    name: '구운 연어',
    tags: ['오메가 3', '비타민 D'],
    nutrients: [
      { name: '오메가 3', percent: 92 },
      { name: '비타민 D', percent: 78 },
      { name: '단백질', percent: 72 },
    ],
    description:
      '연어 100g으로 비타민 D와 오메가 3 하루 권장량의 80%를 채울 수 있어요. 다음 끼니에 추가하면 밸런스가 좋아요.',
    recipes: ['연어 샐러드', '간단 연어 오차즈케'],
  },
  {
    id: 'tofu-salad',
    name: '두부 샐러드',
    tags: ['단백질', '식이섬유'],
    nutrients: [
      { name: '단백질', percent: 68 },
      { name: '식이섬유', percent: 63 },
      { name: '칼슘', percent: 46 },
    ],
    description:
      '두부 150g과 채소를 곁들이면 부족한 단백질과 식이섬유를 가볍게 보충할 수 있어요. 다음 끼니에 더하면 포만감과 균형을 함께 챙길 수 있어요.',
    recipes: ['두부 채소 덮밥', '두부 포케'],
  },
];

export default function MealRecommendationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [remainingChanges, setRemainingChanges] = useState(2);
  const hasMealState = Boolean(
    state?.source || state?.image || state?.description || state?.foods,
  );
  const recommendations = Array.isArray(state?.recommendations)
    ? state.recommendations
    : hasMealState
      ? MOCK_RECOMMENDATIONS
      : [];
  const isPerfectMeal = recommendations.length === 0;
  const foods = Array.isArray(state?.foods)
    ? state.foods
    : isPerfectMeal
      ? MOCK_PERFECT_FOODS
      : MOCK_FOODS;
  const mealAnalysis =
    state?.mealAnalysis ||
    (isPerfectMeal ? MOCK_PERFECT_MEAL_ANALYSIS : MOCK_MEAL_ANALYSIS);
  const recommendation = recommendations[activeIndex];

  const showPrevious = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? recommendations.length - 1 : currentIndex - 1,
    );
  };

  const showNext = () => {
    setActiveIndex(
      (currentIndex) => (currentIndex + 1) % recommendations.length,
    );
  };

  const showAnotherRecommendation = () => {
    if (!remainingChanges) return;

    showNext();
    setRemainingChanges((currentCount) => currentCount - 1);
  };

  const addRecommendation = () => {
    const recommendedFood = {
      id: `recommendation-${recommendation.id}`,
      name: recommendation.name,
      source: 'recommendation',
    };
    const nextFoods = foods.some((food) => food.id === recommendedFood.id)
      ? foods
      : [...foods, recommendedFood];

    navigate('/meals/result', {
      replace: true,
      state: {
        ...state,
        foods: nextFoods,
        recommendationAccepted: true,
      },
    });
  };

  const completeRecord = () => {
    navigate('/calendar', { replace: true });
  };

  return (
    <main className={styles.container}>
      {isPerfectMeal && (
        <div className={styles.perfectHero}>
          <img
            className={styles.perfectDecoration}
            src={perfectDecoration}
            alt=""
          />
          <img
            className={styles.perfectResult}
            src={perfectResult}
            alt="균형 잡힌 식사를 하셨어요. 추천 음식이 없어요."
          />
        </div>
      )}

      <section className={styles.mealSummary}>
        <h1>식사 인식 결과</h1>

        <div className={styles.foodTags}>
          {foods.slice(0, 3).map((food) => (
            <span key={food.id}>{food.name}</span>
          ))}
          <strong>{mealAnalysis.calories} Kcal</strong>
        </div>

        <ul className={styles.mealNutrients}>
          {mealAnalysis.nutrients.map((nutrient) => (
            <li key={nutrient.name}>
              <span>{nutrient.name}</span>
              <div className={styles.mealNutrientBar}>
                <span
                  style={{
                    width: `${Math.min(
                      (nutrient.current / nutrient.target) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
              <strong>
                {nutrient.current}g / {nutrient.target}g
              </strong>
            </li>
          ))}
        </ul>
      </section>

      {isPerfectMeal ? (
        <div className={styles.perfectActionContent}>
          <button
            type="button"
            className={styles.completeButton}
            onClick={completeRecord}
          >
            기록 완료하기
          </button>
          <button
            type="button"
            className={styles.calendarButton}
            onClick={completeRecord}
          >
            <span>캘린더 바로 가기</span>
            <MdArrowForward />
          </button>
        </div>
      ) : (
        <>
          <section className={styles.recommendationContent}>
            <div className={styles.sectionHeader}>
              <h2>다음 끼니에 추가하면 좋을 음식</h2>
              <span>
                <strong>{activeIndex + 1}</strong> / {recommendations.length}
              </span>
            </div>

            <RecommendationCard
              recommendation={recommendation}
              onPrevious={showPrevious}
              onNext={showNext}
            />
          </section>

          <div className={styles.actionContent}>
            <button
              type="button"
              className={styles.otherButton}
              disabled={!remainingChanges}
              onClick={showAnotherRecommendation}
            >
              다른 추천 보기
              <span>{remainingChanges}번 남음</span>
            </button>
            <button
              type="button"
              className={styles.addButton}
              onClick={addRecommendation}
            >
              추가할게요
            </button>
          </div>
        </>
      )}
    </main>
  );
}
