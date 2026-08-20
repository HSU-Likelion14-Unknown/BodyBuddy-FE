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

export async function getMe() {
  const res = await api.get('/users/me');
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
