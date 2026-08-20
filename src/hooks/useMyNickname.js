import { useEffect, useState } from 'react';
import { getMe } from '@/api/user';

function getStoredNickname() {
  try {
    const onboarding = JSON.parse(
      localStorage.getItem('onboarding_step1') || 'null',
    );
    const nickname = onboarding?.nickname?.trim();

    return nickname || '회원';
  } catch {
    return '회원';
  }
}

export function useMyNickname() {
  const [nickname, setNickname] = useState(getStoredNickname);

  useEffect(() => {
    const controller = new AbortController();

    const loadNickname = async () => {
      try {
        const user = await getMe({ signal: controller.signal });
        const nextNickname = user?.nickname?.trim();

        if (!controller.signal.aborted && nextNickname) {
          setNickname(nextNickname);
        }
      } catch {
        // 닉네임 조회 실패 시 저장된 값 유지
      }
    };

    void loadNickname();

    return () => controller.abort();
  }, []);

  return nickname;
}
