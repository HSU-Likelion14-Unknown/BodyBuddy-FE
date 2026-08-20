import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SplashPage.module.scss';
import { postAnonymous } from '@/api/auth';
import { getAccessKey, setAccessKey } from '@/api/tokenStorage';
import {
  clearOnboardingCompletedAt,
  getOnboardingCompletedAt,
  setOnboardingCompletedAt,
} from '@/api/userStorage';

import {
  splashEllipseBg,
  splashCharacter,
  splashIconBulb,
  splashIconCamera,
  splashIconChart,
} from '@/assets';

export default function SplashPage() {
  const navigate = useNavigate();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const delay = new Promise((resolve) => setTimeout(resolve, 3000));

    const init = async () => {
      let onboardingCompletedAt = null;
      try {
        if (!getAccessKey()) {
          const data = await postAnonymous();
          setAccessKey(data.accessKey);
          if (data.onboardingCompletedAt) {
            setOnboardingCompletedAt(data.onboardingCompletedAt);
          } else {
            clearOnboardingCompletedAt();
          }
          onboardingCompletedAt = data.onboardingCompletedAt;
        } else {
          onboardingCompletedAt = getOnboardingCompletedAt();
        }
      } catch {
        // 실패 시 온보딩으로
      }

      await delay;
      navigate(onboardingCompletedAt ? '/home' : '/onboarding/1');
    };

    init();
  }, [navigate]);

  return (
    <div className={styles.splash}>
      {/* 배경 타원 */}
      <div className={styles.ellipseBg}>
        <img src={splashEllipseBg} alt="" />
      </div>

      {/* 로고 & 간단 설명 */}
      <div className={styles.logoSection}>
        <h1 className={styles.logo}>바디버디</h1>
        <p className={styles.tagline}>함께 기록하고, 함께 건강해져요</p>
      </div>

      {/* 주황색 그라디언트 */}
      <div className={styles.gradientShape} />

      {/* 마스코트 캐릭터 */}
      <img
        src={splashCharacter}
        alt="바디버디 캐릭터"
        className={styles.character}
      />

      {/* 핵심 기능 소개 */}
      <div className={styles.features}>
        <div className={styles.featureItem}>
          <img src={splashIconBulb} alt="" className={styles.featureIconBulb} />
          <span className={styles.featureLabel}>맞춤 추천</span>
        </div>
        <div className={styles.featureItem}>
          <img src={splashIconCamera} alt="" className={styles.featureIcon} />
          <span className={styles.featureLabel}>식사 기록</span>
        </div>
        <div className={styles.featureItem}>
          <img
            src={splashIconChart}
            alt=""
            className={styles.featureIconChart}
          />
          <span className={styles.featureLabel}>AI 분석</span>
        </div>
      </div>

      {/* 로딩 인디케이터 */}
      <div className={styles.loading}>
        <div className={styles.dots}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
        <p className={styles.loadingText}>LOADING</p>
      </div>
    </div>
  );
}
