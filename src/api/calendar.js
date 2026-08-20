import api from './instance';
import { resolveImageUrl } from './user';

const unwrap = (response) => response.data?.data ?? response.data;

export async function getDayMeals(date, { signal } = {}) {
  const res = await api.get(`/calendar/days/${date}`, { signal });
  const data = unwrap(res);
  return {
    ...data,
    meals: (data.meals ?? [])
      .sort((a, b) => new Date(a.eatenAt) - new Date(b.eatenAt))
      .map((meal) => ({
        ...meal,
        photoUrl: meal.photoUrl ? resolveImageUrl(meal.photoUrl) : null,
      })),
  };
}

export async function getMonthStats(year, month, { signal } = {}) {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const res = await api.get(`/calendar/months/${monthStr}`, { signal });
  return unwrap(res);
}

export async function getCalendarPhotoBlob(photoUrl, { signal } = {}) {
  if (!photoUrl) return null;
  const res = await api.get(photoUrl, { responseType: 'blob', signal });
  return res.data;
}

export async function patchMealImage(mealId, file) {
  const form = new FormData();
  form.append('image', file);
  const res = await api.patch(`/calendar/meals/${mealId}/image`, form);
  const data = unwrap(res);
  return { ...data, photoUrl: resolveImageUrl(data.photoUrl) };
}
