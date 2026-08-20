import axios from 'axios';
import { postAnonymous } from './auth';
import { clearAccessKey, getAccessKey, setAccessKey } from './tokenStorage';
import {
  clearOnboardingCompletedAt,
  setOnboardingCompletedAt,
} from './userStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  const accessKey = getAccessKey();

  if (accessKey) {
    config.headers.Authorization = `Bearer ${accessKey}`;
  } else {
    delete config.headers.Authorization;
  }

  // 일부 POST는 Idempotency-Key 필수 (누락 시 500)
  // 재시도 시 동일 키 유지 — 기존 값 있으면 덮어쓰지 않음
  if (config.method === 'post' && !config.headers['Idempotency-Key']) {
    config.headers['Idempotency-Key'] = crypto.randomUUID();
  }

  return config;
});

// 401 - 무효해진 accessKey를 버리고 익명 세션을 재발급한 뒤 원요청을 1회만 재시도
api.interceptors.response.use(undefined, async (error) => {
  const { config, response } = error;

  if (response?.status !== 401 || !config || config.isRetriedAfterAuth) {
    return Promise.reject(error);
  }

  config.isRetriedAfterAuth = true;

  try {
    clearAccessKey();
    const session = await postAnonymous();
    setAccessKey(session.accessKey);

    if (session.onboardingCompletedAt) {
      setOnboardingCompletedAt(session.onboardingCompletedAt);
    } else {
      clearOnboardingCompletedAt();

      if (config.requiresOnboarding) {
        const onboardingError = new Error('ONBOARDING_REQUIRED');
        onboardingError.code = 'ONBOARDING_REQUIRED';
        return Promise.reject(onboardingError);
      }
    }
  } catch {
    return Promise.reject(error);
  }

  return api(config);
});

export default api;
