import { useEffect, useState } from 'react';
import { getDayMeals, getMonthStats } from '@/api/calendar';
import { getMealImageBlob } from '@/api/meals';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function pad(value) {
  return String(value).padStart(2, '0');
}

function getCurrentWeek() {
  const kstNow = new Date(Date.now() + KST_OFFSET_MS);
  const today = new Date(
    Date.UTC(
      kstNow.getUTCFullYear(),
      kstNow.getUTCMonth(),
      kstNow.getUTCDate(),
    ),
  );
  const weekStart = new Date(today);
  weekStart.setUTCDate(today.getUTCDate() - today.getUTCDay());

  const todayKey = formatDateKey(today);

  return WEEKDAY_LABELS.map((weekday, index) => {
    const date = new Date(weekStart);
    date.setUTCDate(weekStart.getUTCDate() + index);

    const dateKey = formatDateKey(date);

    return {
      weekday,
      date: date.getUTCDate(),
      dateKey,
      monthKey: dateKey.slice(0, 7),
      image: '',
      recommended: false,
      isToday: dateKey === todayKey,
    };
  });
}

function getNextKstMidnightDelay() {
  const now = Date.now();
  const kstNow = new Date(now + KST_OFFSET_MS);
  const nextMidnight =
    Date.UTC(
      kstNow.getUTCFullYear(),
      kstNow.getUTCMonth(),
      kstNow.getUTCDate() + 1,
    ) - KST_OFFSET_MS;

  return nextMidnight - now + 1000;
}

function formatDateKey(date) {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
  ].join('-');
}

function getLatestPhotoUrl(meals) {
  return [...meals]
    .sort((left, right) => {
      const leftTime = Date.parse(left.eatenAt);
      const rightTime = Date.parse(right.eatenAt);

      if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) return 0;
      return rightTime - leftTime;
    })
    .find((meal) => meal.photoUrl)?.photoUrl;
}

async function loadPhoto(photoUrl, signal, objectUrls) {
  if (!photoUrl) return '';

  if (!photoUrl.includes('/meals/images/')) {
    return photoUrl;
  }

  const blob = await getMealImageBlob(photoUrl, { signal });

  if (!blob || signal.aborted) return '';

  const objectUrl = URL.createObjectURL(blob);
  objectUrls.push(objectUrl);
  return objectUrl;
}

export function useWeeklyCalendar() {
  const [weekDays, setWeekDays] = useState(() => getCurrentWeek());
  const [days, setDays] = useState(weekDays);

  useEffect(() => {
    let timer;

    const scheduleNextDay = () => {
      timer = window.setTimeout(() => {
        const nextWeek = getCurrentWeek();
        setWeekDays(nextWeek);
        setDays(nextWeek);
        scheduleNextDay();
      }, getNextKstMidnightDelay());
    };

    scheduleNextDay();
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const objectUrls = [];

    const loadCalendar = async () => {
      try {
        const monthKeys = [...new Set(weekDays.map((day) => day.monthKey))];
        const monthResults = await Promise.all(
          monthKeys.map(async (month) => {
            try {
              const [year, monthNumber] = month.split('-');
              return await getMonthStats(year, monthNumber, {
                signal: controller.signal,
              });
            } catch (error) {
              if (controller.signal.aborted) throw error;
              return null;
            }
          }),
        );
        const statusByDate = new Map(
          monthResults
            .flatMap((result) => result?.days ?? [])
            .map((day) => [day.date, day]),
        );

        const nextDays = await Promise.all(
          weekDays.map(async (day) => {
            const status = statusByDate.get(day.dateKey);
            const recommended = (status?.selectedRecommendationCount ?? 0) > 0;

            if (!status?.mealCount) return { ...day, recommended };

            try {
              const dailyResult = await getDayMeals(day.dateKey, {
                signal: controller.signal,
              });
              const photoUrl = getLatestPhotoUrl(dailyResult?.meals ?? []);
              const image = await loadPhoto(
                photoUrl,
                controller.signal,
                objectUrls,
              );

              return { ...day, image, recommended };
            } catch {
              return { ...day, recommended };
            }
          }),
        );

        if (!controller.signal.aborted) setDays(nextDays);
      } catch {
        if (!controller.signal.aborted) setDays(weekDays);
      }
    };

    void loadCalendar();

    return () => {
      controller.abort();
      objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
    };
  }, [weekDays]);

  return days;
}
