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

function resolveImageUrl(url) {
  if (!url) return null;
  try {
    new URL(url); // 절대 경로면 그대로
    return url;
  } catch {
    // 상대 경로면 + API origin
    return `${new URL(import.meta.env.VITE_API_URL).origin}${url}`;
  }
}

export async function getMe() {
  const res = await api.get('/users/me');
  const data = res.data.data;
  return { ...data, profileImageUrl: resolveImageUrl(data.profileImageUrl) };
}

export async function patchProfileImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.patch('/users/me/profile-image', formData);
  const data = res.data.data;
  return { ...data, profileImageUrl: resolveImageUrl(data.profileImageUrl) };
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
    .filter((k) => k !== 'none')
    .map((k) => ALLERGEN_CODE_MAP[k])
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

  return res.data.data;
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
    .filter((k) => k !== 'none')
    .map((k) => ALLERGEN_CODE_MAP[k])
    .filter(Boolean);

  const allergyCodes = [...mappedCodes, ...customAllergens];

  const res = await api.put('/users/me/onboarding', {
    nickname,
    birthYear: birthYear ?? null,
    gender: GENDER_MAP[gender] ?? 'PREFER_NOT_TO_SAY',
    allergyCodes: allergyCodes.length ? allergyCodes : [],
    dislikedFoods: dislikedFoods.length ? dislikedFoods : [],
  });

  return res.data.data;
}
