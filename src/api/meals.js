import api from './instance';

// POST 사진 업로드 및 음식 인식 시작
export const createImageMeal = async (image, eatenAt) => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('eatenAt', eatenAt);

  const response = await api.post('/meals/images', formData);
  return response.data;
};

// POST 직접 입력한 설명으로 식사 기록 생성
export const createTextMeal = async (payload) => {
  const response = await api.post('/meals/text', payload);
  return response.data;
};

// GET 분석 상태 및 식사 상세 조회
export const getMeal = async (mealId, { signal } = {}) => {
  const response = await api.get(`/meals/${mealId}`, { signal });
  return response.data;
};

// GET 음식 인식 후보 조회
export const getRecognitionCandidates = async (mealId, { signal } = {}) => {
  const response = await api.get(`/meals/${mealId}/recognition-candidates`, {
    signal,
  });
  return response.data;
};

// POST 검토한 음식과 섭취량 확정
export const confirmMeal = async (mealId, payload) => {
  const response = await api.post(`/meals/${mealId}/confirm`, payload);
  return response.data;
};

// POST 추천 없는 식사 기록 완료
export const completeMeal = async (mealId) => {
  const response = await api.post(`/meals/${mealId}/complete`);
  return response.data;
};

// POST 다음 끼니 추천 생성
export const createMealRecommendation = async (mealId) => {
  const response = await api.post(`/meals/${mealId}/recommendations`);
  return response.data;
};

// POST 추천 재생성 — 기존 재료를 겹치지 않는 새 재료로 교체
export const refreshRecommendation = async (recommendationId) => {
  const response = await api.post(
    `/recommendations/${recommendationId}/refresh`,
  );
  return response.data;
};

// POST 추천 선택 또는 건너뛰기
export const decideRecommendation = async (recommendationId, payload) => {
  const response = await api.post(
    `/recommendations/${recommendationId}/decision`,
    payload,
  );
  return response.data;
};

// GET 저장된 식사 사진 (인증 필요 — img src로 직접 못 쓰고 blob으로 받는다)
export const getMealImageBlob = async (photoUrl, { signal } = {}) => {
  const objectKey = photoUrl.split('/meals/images/')[1];

  if (!objectKey) return null;

  const response = await api.get(`/meals/images/${objectKey}`, {
    responseType: 'blob',
    signal,
  });
  return response.data;
};
