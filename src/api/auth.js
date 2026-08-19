import api from './instance';

const ANONYMOUS_IDEM_KEY = 'bodybuddy.anonymousIdempotencyKey';

function getOrCreateIdempotencyKey() {
  let key = localStorage.getItem(ANONYMOUS_IDEM_KEY);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_IDEM_KEY, key);
  }
  return key;
}

export async function postAnonymous() {
  const res = await api.post(
    '/auth/anonymous',
    {},
    {
      skipAuth: true,
      headers: { 'Idempotency-Key': getOrCreateIdempotencyKey() },
    },
  );
  return res.data.data;
}
