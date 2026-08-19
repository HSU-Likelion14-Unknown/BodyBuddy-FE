import { useState } from 'react';
import { MdArrowForward } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { mealPlaceholder, perfectDecoration, perfectResult } from '@/assets';
import RecommendationCard from './components/RecommendationCard';
import { useRecommendationDecision } from './hooks/useRecommendationDecision';
import { formatAmount, getNutrientSummary, toCard } from './recommendationView';
import styles from './MealRecommendationPage.module.scss';

export default function MealRecommendationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  // 1개로 시작해 '다른 추천 보기'마다 하나씩 공개 (서버 최대 3개)
  const [revealedCount, setRevealedCount] = useState(1);

  const recommendationResult = state?.recommendation;
  const ingredients = recommendationResult?.ingredients ?? [];
  const revealedIngredients = ingredients.slice(0, revealedCount);
  const activeIngredient = revealedIngredients[activeIndex];
  const remainingChanges = ingredients.length - revealedCount;
  const isNoCandidate = recommendationResult?.status === 'NO_CANDIDATE';
  const isCreated = recommendationResult?.status === 'CREATED';
  // NO_CANDIDATE 사유 구분 — BALANCED_MEAL만 "완벽한 식사",
  // NO_SAFE_CANDIDATE는 부족분이 있으나 추천 재료를 못 찾은 경우
  const isBalancedMeal =
    isNoCandidate &&
    recommendationResult?.noRecommendationReason === 'BALANCED_MEAL';
  const recommendation = activeIngredient
    ? toCard(activeIngredient, recommendationResult.targetNutrient)
    : null;
  const nutrients = getNutrientSummary(recommendationResult);
  const { submitDecision, completeRecord, isSubmitting, errorMessage } =
    useRecommendationDecision(recommendationResult, state?.mealId);

  const showPrevious = () => {
    setActiveIndex((index) =>
      index === 0 ? revealedIngredients.length - 1 : index - 1,
    );
  };

  const showNext = () => {
    setActiveIndex((index) => (index + 1) % revealedIngredients.length);
  };

  const revealAnother = () => {
    if (remainingChanges <= 0) return;

    setActiveIndex(revealedCount);
    setRevealedCount((count) => count + 1);
  };

  return (
    <main className={styles.container}>
      {isBalancedMeal && (
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

      {isNoCandidate && !isBalancedMeal && (
        <p className={styles.resultTitle}>이번 식사 결과는 다음과 같아요 !</p>
      )}

      <section className={styles.mealSummary}>
        <h1>식사 인식 결과</h1>

        <div className={styles.foodTags}>
          {state?.foods?.slice(0, 3).map((food) => (
            <span key={food.id}>{food.name}</span>
          ))}
          {recommendationResult?.dailyNutrition?.caloriesKcal != null && (
            <strong>
              {formatAmount(recommendationResult.dailyNutrition.caloriesKcal)}{' '}
              Kcal
            </strong>
          )}
        </div>

        <ul className={styles.mealNutrients}>
          {nutrients.map((nutrient) => (
            <li key={nutrient.key}>
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
                {formatAmount(nutrient.current)}
                {nutrient.unit} / {formatAmount(nutrient.target)}
                {nutrient.unit}
              </strong>
            </li>
          ))}
        </ul>
      </section>

      {isNoCandidate && !isBalancedMeal && (
        <img
          className={styles.mealImage}
          src={state?.image || mealPlaceholder}
          alt="기록한 식사"
        />
      )}

      {errorMessage && (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}

      {!isCreated && !isNoCandidate ? (
        <div className={styles.emptyState}>
          <p>추천 결과를 불러오지 못했어요.</p>
          <button type="button" onClick={() => navigate(-1)}>
            이전 화면으로
          </button>
        </div>
      ) : isNoCandidate ? (
        <div className={styles.perfectActionContent}>
          <button
            type="button"
            className={styles.completeButton}
            disabled={isSubmitting}
            onClick={completeRecord}
          >
            {isSubmitting ? '기록 중...' : '기록 완료하기'}
          </button>
          <button
            type="button"
            className={styles.calendarButton}
            disabled={isSubmitting}
            onClick={completeRecord}
          >
            <span>캘린더 바로 가기</span>
            <MdArrowForward />
          </button>
        </div>
      ) : !recommendation ? (
        <div className={styles.emptyState}>
          <p>추천 음식이 없어요.</p>
        </div>
      ) : (
        <>
          <section className={styles.recommendationContent}>
            <div className={styles.sectionHeader}>
              <h2>다음 끼니에 추가하면 좋을 음식</h2>
              <span>
                <strong>{activeIndex + 1}</strong> /{' '}
                {revealedIngredients.length}
              </span>
            </div>

            <RecommendationCard
              recommendation={recommendation}
              onPrevious={showPrevious}
              onNext={showNext}
              canNavigate={revealedIngredients.length > 1}
            />
          </section>

          <div className={styles.actionContent}>
            <button
              type="button"
              className={styles.otherButton}
              disabled={isSubmitting || remainingChanges <= 0}
              onClick={revealAnother}
            >
              다른 추천 보기
              <span>{remainingChanges}번 남음</span>
            </button>
            <button
              type="button"
              className={styles.skipButton}
              disabled={isSubmitting}
              onClick={() => submitDecision('SKIPPED', activeIngredient)}
            >
              이번 추천 건너뛰기
            </button>
            <button
              type="button"
              className={styles.addButton}
              disabled={isSubmitting}
              onClick={() => submitDecision('SELECTED', activeIngredient)}
            >
              {isSubmitting ? '저장 중...' : '추가할게요'}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
