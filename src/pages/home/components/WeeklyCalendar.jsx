import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa6';
import {
  homeCalendarFri,
  homeCalendarMon,
  homeCalendarSat,
  homeCalendarTue,
  homeCalendarWed,
} from '@/assets';
import styles from './WeeklyCalendar.module.scss';

const WEEK_DAYS = [
  { weekday: '일', date: 4 },
  {
    weekday: '월',
    date: 5,
    image: homeCalendarMon,
    recommended: true,
  },
  {
    weekday: '화',
    date: 6,
    image: homeCalendarTue,
    recommended: true,
  },
  {
    weekday: '수',
    date: 7,
    image: homeCalendarWed,
  },
  { weekday: '목', date: 8 },
  {
    weekday: '금',
    date: 9,
    image: homeCalendarFri,
  },
  {
    weekday: '토',
    date: 10,
    image: homeCalendarSat,
    recommended: true,
    isToday: true,
  },
];

export default function WeeklyCalendar() {
  const navigate = useNavigate();

  return (
    <section className={styles.calendarSection}>
      <div className={styles.calendarContent}>
        <div className={styles.titleRow}>
          <h2>주간 캘린더</h2>
        </div>

        <div className={styles.week}>
          <div className={styles.weekdays}>
            {WEEK_DAYS.map(({ weekday, date }) => (
              <span key={date}>{weekday}</span>
            ))}
          </div>

          <ol className={styles.dates}>
            {WEEK_DAYS.map((day) => (
              <li
                key={day.date}
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
