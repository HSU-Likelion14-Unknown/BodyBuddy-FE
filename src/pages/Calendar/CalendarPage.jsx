import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './CalendarPage.module.scss';
import { iconBell, iconChevronDown } from '@/assets';
import { BsChevronLeft } from 'react-icons/bs';

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// TODO: 실제 API 연동 시 교체
const DOT_DATA = {
  '2026-07-10': ['record'],
  '2026-07-15': ['recommended'],
  '2026-07-20': ['record', 'missed'],
  '2026-07-26': ['record'],
  '2026-07-28': ['record', 'recommended'],
  '2026-07-31': ['missed'],
  '2026-08-01': ['record'],
  '2026-08-02': ['record', 'recommended', 'missed'],
  '2026-08-04': ['record', 'missed'],
  '2026-08-07': ['recommended'],
  '2026-08-10': ['record', 'missed'],
  '2026-08-12': ['record', 'recommended'],
  '2026-08-14': ['missed'],
  '2026-08-15': ['record'],
};

const DOT_CLASS = {
  record: styles.dotRecord,
  recommended: styles.dotRecommended,
  missed: styles.dotMissed,
};

function MonthPickerModal({ viewDate, onSelect, onClose }) {
  const [pickerYear, setPickerYear] = useState(viewDate.getFullYear());

  const months = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];

  const handleSelect = (monthIndex) => {
    onSelect(new Date(pickerYear, monthIndex, 1));
    onClose();
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.pickerCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.pickerYearRow}>
          <button
            className={styles.pickerArrow}
            onClick={() => setPickerYear((y) => y - 1)}
          >
            ‹
          </button>
          <span className={styles.pickerYear}>{pickerYear}년</span>
          <button
            className={styles.pickerArrow}
            onClick={() => setPickerYear((y) => y + 1)}
          >
            ›
          </button>
        </div>
        <div className={styles.pickerMonthGrid}>
          {months.map((label, i) => (
            <button
              key={i}
              className={`${styles.pickerMonthBtn} ${
                pickerYear === currentYear && i === currentMonth
                  ? styles.pickerMonthActive
                  : ''
              }`}
              onClick={() => handleSelect(i)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const year = viewDate.getFullYear();
  const month = String(viewDate.getMonth() + 1).padStart(2, '0');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => navigate(-1)}>
          <BsChevronLeft size={19} />
        </button>
        <button className={styles.iconBtn} aria-label="알림">
          <img src={iconBell} alt="알림" />
        </button>
      </div>

      <button className={styles.monthNav} onClick={() => setShowPicker(true)}>
        <span className={styles.monthLabel}>
          {year}. {month}
        </span>
        <img src={iconChevronDown} alt="" className={styles.chevronDown} />
      </button>

      <div className={styles.calendarWrap}>
        <Calendar
          value={selectedDate}
          onChange={setSelectedDate}
          activeStartDate={new Date(year, viewDate.getMonth(), 1)}
          onActiveStartDateChange={({ activeStartDate }) =>
            setViewDate(activeStartDate)
          }
          calendarType="gregory"
          showNavigation={false}
          showNeighboringMonth
          formatDay={(locale, date) => String(date.getDate())}
          formatShortWeekday={(locale, date) =>
            ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
          }
          tileClassName={({ date, view, activeStartDate }) => {
            if (view !== 'month') return null;
            return date.getMonth() !== activeStartDate.getMonth()
              ? styles.neighboringTile
              : null;
          }}
          tileContent={({ date, view }) => {
            if (view !== 'month') return null;
            const dots = DOT_DATA[formatDateKey(date)];
            return (
              <div className={styles.dotRow}>
                {dots?.map((type, i) => (
                  <span
                    key={i}
                    className={`${styles.dot} ${DOT_CLASS[type]}`}
                  />
                ))}
              </div>
            );
          }}
        />
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotRecord}`} />
          기록 있음
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotRecommended}`} />
          추천 챙김
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.dotMissed}`} />
          추천 미챙김
        </span>
      </div>

      {showPicker && (
        <MonthPickerModal
          viewDate={viewDate}
          onSelect={setViewDate}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
