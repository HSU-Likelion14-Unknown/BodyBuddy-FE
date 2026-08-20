import axios from 'axios';

const ANONYMOUS_IDEM_KEY = 'bodybuddy.anonymousIdempotencyKey';

// 익명 발급은 인증 헤더도, 401 재발급도 타면 안 되므로 별도 클라이언트 사용
const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: 'application/json' },
});

function getOrCreateIdempotencyKey() {
  let key = localStorage.getItem(ANONYMOUS_IDEM_KEY);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_IDEM_KEY, key);
  }
  return key;
}

export async function postAnonymous() {
  const res = await authClient.post(
    '/auth/anonymous',
    {},
    { headers: { 'Idempotency-Key': getOrCreateIdempotencyKey() } },
  );
  return res.data?.data ?? res.data;
}
