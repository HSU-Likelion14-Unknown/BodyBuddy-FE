import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

// TODO: 실제 API 연동 시 교체
const MEAL_RECORDS = {
  '2026-08-15': [
    {
      foods: ['마라탕'],
      kcal: 450,
      protein: { consumed: 48, goal: 65 },
      carbs: { consumed: 284, goal: 300 },
      fat: { consumed: 51, goal: 65 },
      recommendation: '연어 구이',
    },
  ],
  '2026-08-12': [
    {
      foods: ['샐러드', '닭가슴살'],
      kcal: 320,
      protein: { consumed: 40, goal: 65 },
      carbs: { consumed: 180, goal: 300 },
      fat: { consumed: 18, goal: 65 },
      recommendation: '삼겹살',
    },
    {
      foods: ['비빔밥', '환장국', '깍두기'],
      kcal: 620,
      protein: { consumed: 54, goal: 65 },
      carbs: { consumed: 264, goal: 300 },
      fat: { consumed: 36, goal: 65 },
      recommendation: null,
    },
  ],
  '2026-08-02': [
    {
      foods: ['돼지국밥'],
      kcal: 580,
      protein: { consumed: 50, goal: 65 },
      carbs: { consumed: 240, goal: 300 },
      fat: { consumed: 45, goal: 65 },
      recommendation: '야채 샐러드',
    },
    {
      foods: ['김치찌개', '공기밥'],
      kcal: 520,
      protein: { consumed: 35, goal: 65 },
      carbs: { consumed: 280, goal: 300 },
      fat: { consumed: 28, goal: 65 },
      recommendation: '닭가슴살',
    },
    {
      foods: ['치킨', '맥주'],
      kcal: 890,
      protein: { consumed: 60, goal: 65 },
      carbs: { consumed: 295, goal: 300 },
      fat: { consumed: 62, goal: 65 },
      recommendation: null,
    },
  ],
  '2026-08-04': [
    {
      foods: ['토스트', '커피'],
      kcal: 280,
      protein: { consumed: 15, goal: 65 },
      carbs: { consumed: 160, goal: 300 },
      fat: { consumed: 12, goal: 65 },
      recommendation: '닭볶음탕',
    },
  ],
};

// TODO: 실제 API 연동 시 교체
const MONTHLY_STATS = {
  nickname: '00',
  nutrients: [
    { name: '단백질', consumed: 180, goal: 650, color: '#8cb3f6' },
    { name: '탄수화물', consumed: 1700, goal: 3000, color: '#ffa449' },
    { name: '지방', consumed: 260, goal: 650, color: '#f29cd8' },
  ],
  kcal: 660,
  recommendFollowed: 11,
  recommendTotal: 15,
};

function DotMatrix({ consumed, goal, color }) {
  const total = 42; // 6행 × 7열
  const filled = Math.round((consumed / goal) * total);
  return (
    // scaleY(-1)로 아래 → 위 방향 채우기
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

function MonthlyNutritionCard() {
  const { nickname, nutrients, kcal, recommendFollowed, recommendTotal } =
    MONTHLY_STATS;
  const pct = Math.round((recommendFollowed / recommendTotal) * 100);

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
          <span className={styles.kcalNumber}>{kcal}</span>
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

function DateDetailCard({ date, datePhotos, onPhotoChange }) {
  const dateKey = formatDateKey(date);
  const records = MEAL_RECORDS[dateKey] || [];
  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef(null);

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const record = records[activeTab] ?? null;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(activeTab, String(reader.result));
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className={styles.detailCard}>
      <div className={styles.detailHeader}>
        <span className={styles.detailDate}>
          {month}월 {day}일
        </span>
        <div className={styles.tabList}>
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              className={`${styles.tabBtn} ${activeTab === i && i < records.length ? styles.tabActive : ''}`}
              onClick={() => i < records.length && setActiveTab(i)}
              disabled={i >= records.length}
            >
              기록 {i + 1}
            </button>
          ))}
        </div>
      </div>

      {record ? (
        <>
          <div className={styles.foodTags}>
            {record.foods.map((food) => (
              <span key={food} className={styles.foodTag}>
                {food}
              </span>
            ))}
            <span className={styles.kcalTag}>{record.kcal} Kcal</span>
          </div>

          <div className={styles.nutritionBars}>
            <NutritionBar
              label="단백질"
              consumed={record.protein.consumed}
              goal={record.protein.goal}
            />
            <NutritionBar
              label="탄수화물"
              consumed={record.carbs.consumed}
              goal={record.carbs.goal}
            />
            <NutritionBar
              label="지방"
              consumed={record.fat.consumed}
              goal={record.fat.goal}
            />
          </div>

          <div className={styles.recommendBanner}>
            <span className={styles.recommendLabel}>
              <img src={iconForkKnife} alt="" className={styles.forkIcon} />
              바디버디의 한끼 추천
            </span>
            <p className={styles.recommendText}>
              {record.recommendation ?? '영양소 밸런스가 완벽해요!'}
            </p>
          </div>

          <div className={styles.photoArea}>
            <div className={styles.photoWrapper}>
              <img
                src={datePhotos[activeTab] ?? record.photo ?? mealPlaceholder}
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

      <MonthlyNutritionCard />

      {selectedDate && (
        <>
          <div
            className={styles.cardOverlay}
            onClick={() => setSelectedDate(null)}
          />
          <DateDetailCard
            key={formatDateKey(selectedDate)}
            date={selectedDate}
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
