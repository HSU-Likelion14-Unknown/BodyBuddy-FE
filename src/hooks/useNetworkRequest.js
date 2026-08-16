import { useNavigate, useLocation } from 'react-router-dom';

// 네트워크 요청 실행 훅 실패 시 자동으로 /error/network로 이동하고,
// 다시 시도하기 누르면 현재 페이지로 복귀
export function useNetworkRequest() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return async function networkRequest(fn) {
    try {
      return await fn();
    } catch (error) {
      const isNetworkError =
        error instanceof TypeError ||
        error?.message === 'Network Error' ||
        !navigator.onLine;

      if (isNetworkError) {
        navigate('/error/network', { state: { from: pathname } });
        return;
      }

      throw error;
    }
  };
}
