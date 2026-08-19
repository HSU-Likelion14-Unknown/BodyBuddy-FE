const ACCESS_KEY_STORAGE_KEY = 'bodybuddy.accessKey';

export function getAccessKey() {
  const accessKey = localStorage.getItem(ACCESS_KEY_STORAGE_KEY);

  // 'undefined'·'null' 문자열은 유효한 키로 취급하지 않음
  if (!accessKey || accessKey === 'undefined' || accessKey === 'null') {
    return null;
  }

  return accessKey;
}

export function setAccessKey(accessKey) {
  if (typeof accessKey !== 'string' || !accessKey) {
    throw new Error('발급받은 accessKey가 올바르지 않습니다.');
  }

  localStorage.setItem(ACCESS_KEY_STORAGE_KEY, accessKey);
}

export function clearAccessKey() {
  localStorage.removeItem(ACCESS_KEY_STORAGE_KEY);
}
