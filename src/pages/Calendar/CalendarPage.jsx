import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDayMeals, getMonthStats } from '@/api/calendar';
import { getMe } from '@/api/user';
import { useNetworkRequest } from '@/hooks/useNetworkRequest';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './CalendarPage.module.scss';
import {
  iconBell,
  iconChevronDown,
  mealPlaceholder,
  iconForkKnife,
} from '@/assets';
import { BsChevronLeft } from 'react-icons/bs';
import { MdEdit } from 'react-icons/md';

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function DotMatrix({ consumed, goal, color }) {
  const total = 42;
  const filled = Math.round((consumed / goal) * total);
  return (
    <div className={styles.dotMatrix}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={styles.matrixDot}
          style={{ backgroundColor: i < filled ? color : '#ffebd8' }}
        />
      ))}
    </div>
  );
}

function MonthlyNutritionCard({ stats, nickname }) {
  if (!stats) return null;
  const days = stats.days ?? [];
  const recommendFollowed = days.reduce(
    (s, d) => s + d.selectedRecommendationCount,
    0,
  );
  const recommendTotal = days.reduce(
    (s, d) =>
      s + d.selectedRecommendationCount + d.unselectedRecommendationCount,
    0,
  );
  const pct =
    recommendTotal > 0
      ? Math.round((recommendFollowed / recommendTotal) * 100)
      : 0;

  const nutrients = [
    {
      name: '단백질',
      consumed: stats.averageProtein ?? 0,
      goal: 65,
      color: '#8cb3f6',
    },
    {
      name: '탄수화물',
      consumed: stats.averageCarbohydrate ?? 0,
      goal: 300,
      color: '#ffa449',
    },
    {
      name: '지방',
      consumed: stats.averageFat ?? 0,
      goal: 65,
      color: '#f29cd8',
    },
  ];

  return (
    <div className={styles.nutritionCard}>
      <p className={styles.nutritionTitle}>월간 영양 평균</p>
      <div className={styles.nutritionBody}>
        <div className={styles.nutrientList}>
          {nutrients.map(({ name, consumed, goal, color }) => (
            <div key={name} className={styles.nutrientItem}>
              <DotMatrix consumed={consumed} goal={goal} color={color} />
              <span className={styles.nutrientName}>{name}</span>
            </div>
          ))}
        </div>
        <div className={styles.kcalCircle}>
          <span className={styles.kcalNumber}>
            {stats.averageCalories ?? '-'}
          </span>
          <span className={styles.kcalLabel}>Kcal</span>
        </div>
      </div>
      <p className={styles.nutritionFooter}>
        {nickname}님의 추천 챙긴 횟수
        <br />
        <span className={styles.footerCount}>
          {recommendFollowed} / {recommendTotal}회
        </span>{' '}
        <span className={styles.footerPct}>( {pct}% )</span>
      </p>
    </div>
  );
}

function NutritionBar({ label, consumed, goal }) {
  const pct = Math.min((consumed / goal) * 100, 100);
  return (
    <div className={styles.barRow}>
      <span className={styles.barLabel}>{label}</span>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.barValue}>
        {consumed}g / {goal}g
      </span>
    </div>
  );
}

function DateDetailCard({ date, meals, datePhotos, onPhotoChange }) {
  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef(null);

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const meal = meals[activeTab] ?? null;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(activeTab, String(reader.result));
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const hasNutrition =
    meal &&
    (meal.protein != null || meal.carbohydrate != null || meal.fat != null);

  return (
    <div className={styles.detailCard}>
      <div className={styles.detailHeader}>
        <span className={styles.detailDate}>
          {month}월 {day}일
        </span>
        <div className={styles.tabList}>
          {meals.map((_, i) => (
            <button
              key={i}
              className={`${styles.tabBtn} ${activeTab === i ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(i)}
            >
              기록 {i + 1}
            </button>
          ))}
        </div>
      </div>

      {meal ? (
        <>
          <div className={styles.foodTags}>
            {meal.foodNames.map((food) => (
              <span key={food} className={styles.foodTag}>
                {food}
              </span>
            ))}
            {meal.calories != null && (
              <span className={styles.kcalTag}>{meal.calories} Kcal</span>
            )}
          </div>

          {hasNutrition && (
            <div className={styles.nutritionBars}>
              {meal.protein != null && (
                <NutritionBar
                  label="단백질"
                  consumed={meal.protein}
                  goal={65}
                />
              )}
              {meal.carbohydrate != null && (
                <NutritionBar
                  label="탄수화물"
                  consumed={meal.carbohydrate}
                  goal={300}
                />
              )}
              {meal.fat != null && (
                <NutritionBar label="지방" consumed={meal.fat} goal={65} />
              )}
            </div>
          )}

          {meal.recommendedDishName && (
            <div className={styles.recommendBanner}>
              <span className={styles.recommendLabel}>
                <img src={iconForkKnife} alt="" className={styles.forkIcon} />
                바디버디의 한끼 추천
              </span>
              <p className={styles.recommendText}>{meal.recommendedDishName}</p>
            </div>
          )}

          <div className={styles.photoArea}>
            <div className={styles.photoWrapper}>
              <img
                src={datePhotos[activeTab] ?? meal.photoUrl ?? mealPlaceholder}
                alt="식사 사진"
                className={styles.foodPhoto}
              />
              <button
                className={styles.editBtn}
                aria-label="수정"
                onClick={() => fileInputRef.current?.click()}
              >
                <MdEdit size={12} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoChange}
              />
            </div>
          </div>
        </>
      ) : (
        <p className={styles.noRecord}>기록이 없습니다</p>
      )}
    </div>
  );
}

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
  const [allLocalPhotos, setAllLocalPhotos] = useState({});
  const [dayMeals, setDayMeals] = useState([]);
  const [monthStats, setMonthStats] = useState(null);
  const [dotDays, setDotDays] = useState({});
  const [nickname, setNickname] = useState('');
  const networkRequest = useNetworkRequest();

  useEffect(() => {
    networkRequest(() => getMe()).then((data) => {
      if (data) setNickname(data.nickname ?? '');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1;
    networkRequest(() => getMonthStats(year, month)).then((data) => {
      if (!data) return;
      setMonthStats(data);
      const dots = {};
      (data.days ?? []).forEach(({ date, records = [] }) => {
        const statuses = new Set(records.map((r) => r.status));
        const dayDots = [];
        if (statuses.has('RECORD_ONLY')) dayDots.push('record');
        if (statuses.has('RECOMMENDATION_FOLLOWED'))
          dayDots.push('recommended');
        if (statuses.has('RECOMMENDATION_MISSED')) dayDots.push('missed');
        if (dayDots.length > 0) dots[date] = dayDots;
      });
      setDotDays(dots);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewDate]);

  useEffect(() => {
    if (!selectedDate) return;
    networkRequest(() => getDayMeals(formatDateKey(selectedDate))).then(
      (data) => {
        if (data) setDayMeals(data.meals ?? []);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handlePhotoChange = (dateKey, tabIndex, dataUrl) => {
    setAllLocalPhotos((prev) => ({
      ...prev,
      [dateKey]: { ...(prev[dateKey] ?? {}), [tabIndex]: dataUrl },
    }));
  };

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
            const dots = dotDays[formatDateKey(date)];
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

      <MonthlyNutritionCard stats={monthStats} nickname={nickname} />

      {selectedDate && (
        <>
          <div
            className={styles.cardOverlay}
            onClick={() => setSelectedDate(null)}
          />
          <DateDetailCard
            key={formatDateKey(selectedDate)}
            date={selectedDate}
            meals={dayMeals}
            datePhotos={allLocalPhotos[formatDateKey(selectedDate)] ?? {}}
            onPhotoChange={(tabIndex, dataUrl) =>
              handlePhotoChange(formatDateKey(selectedDate), tabIndex, dataUrl)
            }
          />
        </>
      )}

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
