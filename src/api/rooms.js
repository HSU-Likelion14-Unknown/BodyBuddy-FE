import api from './instance';

// 공유방 API는 응답을 {isSuccess, ..., data} 형태로 감쌈
const unwrap = (response) => response.data?.data ?? response.data;

// 공개 이미지 경로 → API 서버 URL
export const resolveImageUrl = (imageUrl) => {
  if (typeof imageUrl !== 'string' || !imageUrl.trim()) return '';

  const normalizedUrl = imageUrl.trim();
  if (/^(https?:|blob:|data:image\/)/i.test(normalizedUrl)) {
    return normalizedUrl;
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(normalizedUrl)) return '';

  const publicPath = normalizedUrl.replace(/^\/+app(?=\/uploads\/)/i, '');

  try {
    const apiOrigin = new URL(import.meta.env.VITE_API_URL).origin;
    return new URL(publicPath, `${apiOrigin}/`).href;
  } catch {
    return '';
  }
};

// POST 공유방 생성
export const createRoom = async (payload) => {
  const response = await api.post('/rooms', payload);
  return unwrap(response);
};

// GET 참여 중인 공유방 목록 조회
export const getMyRooms = async ({ signal } = {}) => {
  const response = await api.get('/rooms/me', { signal });
  return unwrap(response);
};

// POST 초대 코드로 공유방 참여
export const joinRoom = async (code, { requestKey } = {}) => {
  const response = await api.post(
    '/rooms/join',
    { code },
    {
      requiresOnboarding: true,
      ...(requestKey
        ? { headers: { 'Idempotency-Key': requestKey } }
        : {}),
    },
  );
  return unwrap(response);
};

// POST 일회성 초대 코드 발급
export const createRoomInvite = async (roomId, { signal } = {}) => {
  const response = await api.post(`/rooms/${roomId}/invites`, undefined, {
    signal,
  });
  return unwrap(response);
};

// GET 공유방 멤버 목록 조회
export const getRoomMembers = async (roomId, { signal } = {}) => {
  const response = await api.get(`/rooms/${roomId}/members`, { signal });
  return unwrap(response);
};

// GET 멤버 식사 기록 모아보기
export const getRoomFeed = async (roomId, date, { signal } = {}) => {
  const response = await api.get(`/rooms/${roomId}/feed`, {
    params: { date },
    signal,
  });
  return unwrap(response);
};

// DELETE 공유방 나가기
export const leaveRoom = async (roomId) => {
  const response = await api.delete(`/rooms/${roomId}/members/me`);
  return unwrap(response);
};

// PATCH 공유방 커버 이미지 설정
export const updateRoomCover = async (roomId, image) => {
  const formData = new FormData();
  formData.append('image', image);

  const response = await api.patch(`/rooms/${roomId}/cover`, formData);
  return unwrap(response);
};

// PUT 식사 기록에 남긴 내 이모지 반응 전체 교체
export const putMealReactions = async (roomId, mealId, emojiTypes) => {
  const response = await api.put(`/rooms/${roomId}/meals/${mealId}/reactions`, {
    emojiTypes,
  });
  return unwrap(response);
};

// GET 식사별 반응 목록 조회
export const getMealReactions = async (roomId, mealId, { signal } = {}) => {
  const response = await api.get(`/rooms/${roomId}/meals/${mealId}/reactions`, {
    signal,
  });
  return unwrap(response);
};
