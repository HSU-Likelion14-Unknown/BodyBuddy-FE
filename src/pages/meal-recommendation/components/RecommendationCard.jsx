import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import styles from './RecommendationCard.module.scss';

export default function RecommendationCard({
  recommendation,
  onPrevious,
  onNext,
  canNavigate = true,
}) {
  const tags = Array.isArray(recommendation?.tags) ? recommendation.tags : [];
  const nutrients = Array.isArray(recommendation?.nutrients)
    ? recommendation.nutrients
    : [];
  const recipes = Array.isArray(recommendation?.recipes)
    ? recommendation.recipes
    : [];

  return (
    <div className={styles.cardWrapper}>
      <button
        type="button"
        className={`${styles.arrowButton} ${styles.previousButton}`}
        title="이전 추천"
        disabled={!canNavigate}
        onClick={onPrevious}
      >
        <MdChevronLeft />
      </button>

      <article className={styles.container}>
        <div className={styles.cardHeader}>
          <h2>{recommendation?.name}</h2>
          {tags.length > 0 && <span>{tags.join(' / ')}</span>}
        </div>

        {nutrients.length > 0 && (
          <section className={styles.nutrientContent}>
            <h3>보충되는 영양소</h3>
            <ul>
              {nutrients.map((nutrient) => (
                <li key={nutrient.name}>
                  <span>{nutrient.name}</span>
                  <div className={styles.nutrientBar}>
                    <span style={{ width: `${nutrient.percent}%` }} />
                  </div>
                  <strong>+ {nutrient.percent} %</strong>
                </li>
              ))}
            </ul>
          </section>
        )}

        {recommendation?.description && (
          <p className={styles.description}>{recommendation.description}</p>
        )}

        {recipes.length > 0 && (
          <div className={styles.recipeContent}>
            <span>활용 요리</span>
            <strong>{recipes.join(', ')}</strong>
          </div>
        )}
      </article>

      <button
        type="button"
        className={`${styles.arrowButton} ${styles.nextButton}`}
        title="다음 추천"
        disabled={!canNavigate}
        onClick={onNext}
      >
        <MdChevronRight />
      </button>
    </div>
  );
}
