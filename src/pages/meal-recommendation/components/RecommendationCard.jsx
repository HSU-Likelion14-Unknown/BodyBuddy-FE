import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import styles from './RecommendationCard.module.scss';

export default function RecommendationCard({
  recommendation,
  onPrevious,
  onNext,
}) {
  return (
    <div className={styles.cardWrapper}>
      <button
        type="button"
        className={`${styles.arrowButton} ${styles.previousButton}`}
        title="이전 추천"
        onClick={onPrevious}
      >
        <MdChevronLeft />
      </button>

      <article className={styles.container}>
        <div className={styles.cardHeader}>
          <h2>{recommendation.name}</h2>
          <span>{recommendation.tags.join(' / ')}</span>
        </div>

        <section className={styles.nutrientContent}>
          <h3>보충되는 영양소</h3>
          <ul>
            {recommendation.nutrients.map((nutrient) => (
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

        <p className={styles.description}>{recommendation.description}</p>

        <div className={styles.recipeContent}>
          <span>활용 요리</span>
          <strong>{recommendation.recipes.join(', ')}</strong>
        </div>
      </article>

      <button
        type="button"
        className={`${styles.arrowButton} ${styles.nextButton}`}
        title="다음 추천"
        onClick={onNext}
      >
        <MdChevronRight />
      </button>
    </div>
  );
}
