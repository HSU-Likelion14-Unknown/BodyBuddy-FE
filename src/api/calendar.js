import api from './instance';

export async function getDayMeals(date) {
  const res = await api.get(`/calendar/days/${date}`);
  return res.data.data;
}

export async function getMonthStats(year, month) {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const res = await api.get(`/calendar/months/${monthStr}`);
  return res.data.data;
}
