const ACCESS_KEY_STORAGE_KEY = 'bodybuddy.accessKey';

export function getAccessKey() {
  return localStorage.getItem(ACCESS_KEY_STORAGE_KEY);
}

export function setAccessKey(accessKey) {
  localStorage.setItem(ACCESS_KEY_STORAGE_KEY, accessKey);
}

export function clearAccessKey() {
  localStorage.removeItem(ACCESS_KEY_STORAGE_KEY);
}

