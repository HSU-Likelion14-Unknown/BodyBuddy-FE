import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './CalendarPage.module.scss';
import { iconBell, iconChevronDown } from '@/assets';
import { BsChevronLeft } from 'react-icons/bs';

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
        />
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
