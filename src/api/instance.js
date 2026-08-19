import axios from 'axios';
import { getAccessKey } from './tokenStorage';

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

export default api;
