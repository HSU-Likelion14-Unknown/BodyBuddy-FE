import { useState } from 'react';
import { MdAdd, MdClose, MdRestaurant } from 'react-icons/md';
import styles from './RecognizedFoodCard.module.scss';

export default function RecognizedFoodCard({
  foods,
  onAdd,
  onRemove,
  disabled = false,
}) {
  const [foodName, setFoodName] = useState('');
  const hasRecommendedFood = foods.some(
    (food) => food.source === 'recommendation',
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedFoodName = foodName.trim();
    if (!trimmedFoodName) return;

    onAdd(trimmedFoodName);
    setFoodName('');
  };

  return (
    <section className={styles.container}>
      <div className={styles.cardHeader}>
        <div className={styles.titleContent}>
          <h2>인식된 음식</h2>
          {hasRecommendedFood && <span>추천된 음식이 포함되어 있어요!</span>}
        </div>
        <span className={styles.foodCount}>{foods.length}개</span>
      </div>

      <ul className={styles.foodList}>
        {foods.map((food) => (
          <li
            key={food.id}
            className={`${styles.foodItem} ${
              food.source === 'recommendation' ? styles.recommended : ''
            }`}
          >
            <span className={styles.foodName}>
              <MdRestaurant />
              {food.name}
            </span>
            <button
              type="button"
              className={styles.deleteButton}
              title={`${food.name} 삭제`}
              disabled={disabled}
              onClick={() => onRemove(food.id)}
            >
              <MdClose />
            </button>
          </li>
        ))}
      </ul>

      <form className={styles.addForm} onSubmit={handleSubmit}>
        <input
          className={styles.foodInput}
          value={foodName}
          placeholder="음식 직접 추가"
          disabled={disabled}
          onChange={(event) => setFoodName(event.target.value)}
        />
        <button
          type="submit"
          className={styles.addButton}
          title="음식 추가"
          disabled={disabled || !foodName.trim()}
        >
          <MdAdd />
        </button>
      </form>
    </section>
  );
}
