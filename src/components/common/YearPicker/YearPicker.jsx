import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './YearPicker.module.scss';

const ITEM_HEIGHT = 44;
const VISIBLE_COUNT = 5;
const PADDING_COUNT = Math.floor(VISIBLE_COUNT / 2);

const currentYear = new Date().getFullYear();
const years = Array.from(
  { length: currentYear - 1923 },
  (_, i) => currentYear - i,
);

export default function YearPicker({ value, onChange, onClose }) {
  const listRef = useRef(null);
  const scrollEndTimer = useRef(null);
  const initialIndex = value ? years.indexOf(value) : 0;
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = initialIndex * ITEM_HEIGHT;
    }
  }, []);

  const handleScroll = useCallback(() => {
    clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      if (!listRef.current) return;
      const index = Math.round(listRef.current.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, years.length - 1));
      setSelectedIndex(clamped);
      listRef.current.scrollTo({
        top: clamped * ITEM_HEIGHT,
        behavior: 'smooth',
      });
    }, 100);
  }, []);

  const handleConfirm = () => {
    onChange(years[selectedIndex]);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button className={styles.cancelBtn} onClick={onClose}>
            취소
          </button>
          <span className={styles.headerTitle}>출생연도</span>
          <button className={styles.confirmBtn} onClick={handleConfirm}>
            확인
          </button>
        </div>

        <div className={styles.pickerWrap}>
          {/* 선택 영역 하이라이트 */}
          <div className={styles.selector} />

          <div ref={listRef} className={styles.list} onScroll={handleScroll}>
            {/* 상단 패딩 */}
            {Array.from({ length: PADDING_COUNT }).map((_, i) => (
              <div key={`top-${i}`} className={styles.item} />
            ))}

            {years.map((year, i) => (
              <div
                key={year}
                className={`${styles.item} ${i === selectedIndex ? styles.itemSelected : ''}`}
                onClick={() => {
                  setSelectedIndex(i);
                  listRef.current?.scrollTo({
                    top: i * ITEM_HEIGHT,
                    behavior: 'smooth',
                  });
                }}
              >
                {year}
              </div>
            ))}

            {/* 하단 패딩 */}
            {Array.from({ length: PADDING_COUNT }).map((_, i) => (
              <div key={`bot-${i}`} className={styles.item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
