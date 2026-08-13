import { useState } from 'react';
import { MdAdd, MdClose, MdRestaurant } from 'react-icons/md';
import styles from './RecognizedFoodCard.module.scss';

export default function RecognizedFoodCard({ foods, onAdd, onRemove }) {
  const [foodName, setFoodName] = useState('');

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
        </div>
        <span className={styles.foodCount}>{foods.length}개</span>
      </div>

      <ul className={styles.foodList}>
        {foods.map((food) => (
          <li key={food.id} className={styles.foodItem}>
            <span className={styles.foodName}>
              <MdRestaurant />
              {food.name}
            </span>
            <button
              type="button"
              className={styles.deleteButton}
              title={`${food.name} 삭제`}
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
          onChange={(event) => setFoodName(event.target.value)}
        />
        <button
          type="submit"
          className={styles.addButton}
          title="음식 추가"
          disabled={!foodName.trim()}
        >
          <MdAdd />
        </button>
      </form>
    </section>
  );
}
