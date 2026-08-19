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

  if (config.skipAuth) {
    delete config.headers.Authorization;
    return config;
  }

  const accessKey = getAccessKey();

  if (accessKey) {
    config.headers.Authorization = `Bearer ${accessKey}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default api;
