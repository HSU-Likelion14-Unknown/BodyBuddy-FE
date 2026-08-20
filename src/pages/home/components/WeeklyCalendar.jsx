import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa6';
import { useWeeklyCalendar } from '@/hooks/useWeeklyCalendar';
import styles from './WeeklyCalendar.module.scss';

export default function WeeklyCalendar() {
  const navigate = useNavigate();
  const weekDays = useWeeklyCalendar();

  return (
    <section className={styles.calendarSection}>
      <div className={styles.calendarContent}>
        <div className={styles.titleRow}>
          <h2>주간 캘린더</h2>
        </div>

        <div className={styles.week}>
          <div className={styles.weekdays}>
            {weekDays.map(({ weekday, dateKey }) => (
              <span key={dateKey}>{weekday}</span>
            ))}
          </div>

          <ol className={styles.dates}>
            {weekDays.map((day) => (
              <li
                key={day.dateKey}
                className={`${styles.dateItem} ${
                  day.isToday ? styles.today : ''
                }`}
              >
                <span className={styles.date}>{day.date}</span>
                <span className={styles.thumbnail}>
                  {day.image && (
                    <img
                      className={styles.thumbnailImage}
                      src={day.image}
                      alt=""
                      onError={({ currentTarget }) => {
                        currentTarget.hidden = true;
                      }}
                    />
                  )}
                </span>
                {day.recommended && (
                  <span className={styles.star}>
                    <FaStar />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <button
        type="button"
        className={styles.calendarLink}
        onClick={() => navigate('/calendar')}
      >
        전체 캘린더 보러가기
        <FiArrowRight />
      </button>
    </section>
  );
}
