// 서버 응답 오류와 네트워크 연결 오류 구분
export function isNetworkError(error) {
  return (
    error?.code === 'ERR_NETWORK' ||
    error?.message === 'Network Error' ||
    (error?.isAxiosError === true && !error?.response)
  );
}

// API 오류 메시지 추출 - 메시지 누락 시 기본 문구 반환
export function getApiErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    fallbackMessage
  );
}
