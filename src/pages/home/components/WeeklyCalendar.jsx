import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { FaStar, FaUtensils } from 'react-icons/fa6';
import { useWeeklyCalendar } from '@/hooks/useWeeklyCalendar';
import styles from './WeeklyCalendar.module.scss';

function getDayLabel(day) {
  const recordState = day.hasRecord
    ? day.image
      ? '식사 사진 있음'
      : '식사 기록 있음, 사진 없음'
    : '식사 기록 없음';
  const recommendationState = day.recommended ? ', 추천 챙김' : '';

  return `${day.dateKey} ${day.weekday}요일, ${recordState}${recommendationState}`;
}

export default function WeeklyCalendar() {
  const navigate = useNavigate();
  const weekDays = useWeeklyCalendar();

  return (
    <section
      className={styles.calendarSection}
      aria-labelledby="weekly-calendar-title"
    >
      <div className={styles.calendarContent}>
        <div className={styles.titleRow}>
          <h2 id="weekly-calendar-title">주간 캘린더</h2>
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
                aria-label={getDayLabel(day)}
              >
                <span
                  className={styles.date}
                  aria-current={day.isToday ? 'date' : undefined}
                >
                  {day.date}
                </span>
                <span
                  className={`${styles.thumbnail} ${
                    day.hasRecord
                      ? styles.recordedThumbnail
                      : styles.emptyThumbnail
                  }`}
                >
                  {day.hasRecord && !day.image && (
                    <FaUtensils aria-hidden="true" />
                  )}
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
                  <span className={styles.star} aria-hidden="true">
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
