import api from './instance';
import { resolveImageUrl } from './user';

export async function getDayMeals(date) {
  const res = await api.get(`/calendar/days/${date}`);
  const data = res.data.data;
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

export async function getMonthStats(year, month) {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const res = await api.get(`/calendar/months/${monthStr}`);
  return res.data.data;
}

export async function patchMealImage(mealId, file) {
  const form = new FormData();
  form.append('image', file);
  const res = await api.patch(`/calendar/meals/${mealId}/image`, form);
  const data = res.data.data;
  return { ...data, photoUrl: resolveImageUrl(data.photoUrl) };
}
