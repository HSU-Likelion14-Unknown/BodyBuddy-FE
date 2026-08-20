import api from './instance';

const ALLERGEN_CODE_MAP = {
  egg: 'EGG',
  milk: 'MILK',
  nuts: 'NUTS',
  shellfish: 'SHELLFISH',
  soy: 'SOY',
  wheat: 'WHEAT',
};

const GENDER_MAP = {
  male: 'MALE',
  female: 'FEMALE',
  none: 'PREFER_NOT_TO_SAY',
};

export function resolveImageUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return null;

  const normalizedUrl = url.trim();

  if (/^(https?:|blob:|data:image\/)/i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  if (/^[a-z][a-z\d+.-]*:/i.test(normalizedUrl)) return null;

  const publicPath = normalizedUrl.replace(/^\/+app(?=\/uploads\/)/i, '');

  try {
    const apiOrigin = new URL(import.meta.env.VITE_API_URL).origin;
    return new URL(publicPath, `${apiOrigin}/`).href;
  } catch {
    return null;
  }
}

export async function getMe({ signal } = {}) {
  const res = await api.get('/users/me', { signal });
  const data = res.data?.data ?? res.data;

  return {
    ...data,
    profileImageUrl: resolveImageUrl(data.profileImageUrl),
  };
}

// 공유방 기존 사용처 호환
export const getMyInfo = getMe;

export async function patchProfileImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await api.patch('/users/me/profile-image', formData);
  const data = res.data?.data ?? res.data;

  return {
    ...data,
    profileImageUrl: resolveImageUrl(data.profileImageUrl),
  };
}

export async function patchMe({
  nickname,
  birthYear,
  gender,
  allergens,
  customAllergens,
  dislikedFoods,
  shareToRoom,
}) {
  const mappedCodes = allergens
    .filter((key) => key !== 'none')
    .map((key) => ALLERGEN_CODE_MAP[key])
    .filter(Boolean);

  const allergyCodes = [...mappedCodes, ...customAllergens];

  const res = await api.patch('/users/me', {
    nickname,
    birthYear: birthYear ?? null,
    gender: GENDER_MAP[gender] ?? null,
    allergyCodes,
    dislikeFoods: dislikedFoods,
    shareToRoom,
  });

  return res.data?.data ?? res.data;
}

export async function deleteMe() {
  await api.delete('/users/me');
}

export async function putOnboarding({
  nickname,
  birthYear,
  gender,
  allergens,
  customAllergens,
  dislikedFoods,
}) {
  const mappedCodes = allergens
    .filter((key) => key !== 'none')
    .map((key) => ALLERGEN_CODE_MAP[key])
    .filter(Boolean);

  const allergyCodes = [...mappedCodes, ...customAllergens];

  const res = await api.put('/users/me/onboarding', {
    nickname,
    birthYear: birthYear ?? null,
    gender: GENDER_MAP[gender] ?? 'PREFER_NOT_TO_SAY',
    allergyCodes,
    dislikedFoods,
  });

  return res.data?.data ?? res.data;
}
