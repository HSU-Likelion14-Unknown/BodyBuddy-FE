import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { putOnboarding } from '@/api/user';
import { setOnboardingCompletedAt } from '@/api/userStorage';
import { useNetworkRequest } from '@/hooks/useNetworkRequest';
import { getPendingInvite } from '@/utils/pendingInvite';
import { onboardingCharacter3, iconSearch, iconCloseSmall } from '@/assets';
import OnboardingLayout from './components/OnboardingLayout';
import styles from './OnboardingPage3.module.scss';

export default function OnboardingPage3() {
  const navigate = useNavigate();
  const networkRequest = useNetworkRequest();

  const saved = JSON.parse(
    localStorage.getItem('onboarding_step3') || 'null',
  );

  const [isNone, setIsNone] = useState(saved ? saved.noDisliked : true);
  const [inputValue, setInputValue] = useState('');
  const [customTags, setCustomTags] = useState(
    saved?.dislikedFoods || [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNextEnabled =
    (isNone || customTags.length > 0) && !isSubmitting;

  const handleNoneClick = () => {
    if (!isNone) {
      setIsNone(true);
      setCustomTags([]);
    }
  };

  const addTag = (text) => {
    const trimmed = text.trim();

    if (!trimmed || customTags.includes(trimmed)) {
      setInputValue('');
      return;
    }

    setCustomTags((prev) => [...prev, trimmed]);
    setIsNone(false);
    setInputValue('');
  };

  const removeTag = useCallback((text) => {
    setCustomTags((prev) => {
      const next = prev.filter((tag) => tag !== text);

      if (next.length === 0) {
        setIsNone(true);
      }

      return next;
    });
  }, []);

  const handleInputKeyDown = (event) => {
    if (
      event.key === 'Enter' &&
      !event.nativeEvent.isComposing
    ) {
      addTag(inputValue);
    }
  };

  const handleBack = () => {
    localStorage.setItem(
      'onboarding_step3',
      JSON.stringify({
        noDisliked: isNone,
        dislikedFoods: customTags,
      }),
    );
    localStorage.setItem('onboarding_prev_step', '3');

    if (getPendingInvite()?.onboardingStartedAt) {
      navigate('/onboarding/2', { replace: true });
      return;
    }

    navigate(-1);
  };

  const handleNext = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    localStorage.setItem(
      'onboarding_step3',
      JSON.stringify({
        noDisliked: isNone,
        dislikedFoods: customTags,
      }),
    );

    const step1 = JSON.parse(
      localStorage.getItem('onboarding_step1') || '{}',
    );
    const step2 = JSON.parse(
      localStorage.getItem('onboarding_step2') || '{}',
    );

    try {
      const result = await networkRequest(() =>
        putOnboarding({
          nickname: step1.nickname,
          birthYear: step1.birthYear ?? null,
          gender: step1.gender ?? 'none',
          allergens: step2.allergens ?? [],
          customAllergens: step2.customAllergens ?? [],
          dislikedFoods: isNone ? [] : customTags,
        }),
      );

      if (!result) return;

      setOnboardingCompletedAt(
        result.onboardingCompletedAt ?? new Date().toISOString(),
      );

      const pendingInvite = getPendingInvite();

      if (
        pendingInvite?.code &&
        pendingInvite.onboardingStartedAt
      ) {
        navigate(
          `/share-room/invite/${encodeURIComponent(
            pendingInvite.code,
          )}`,
          {
            replace: true,
            state: {
              joinAfterOnboarding: pendingInvite.code,
            },
          },
        );
        return;
      }

      navigate('/home', { replace: true });
    } catch (error) {
      console.error('온보딩 저장 실패:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      step={3}
      image={onboardingCharacter3}
      title={
        <>
          싫어하는 음식이
          <br />
          있나요?
        </>
      }
      subtitle="복수 선택 가능"
      isNextEnabled={isNextEnabled}
      onBack={handleBack}
      onNext={handleNext}
    >
      <div className={styles.pageContent}>
        <div className={styles.noneSection}>
          <button
            type="button"
            className={`${styles.noneBtn} ${
              isNone ? styles.noneBtnActive : ''
            }`}
            onClick={handleNoneClick}
          >
            없어요.
          </button>
        </div>

        <p className={styles.orDivider}>or</p>

        <div className={styles.inputSection}>
          <div className={styles.searchWrap}>
            <img
              src={iconSearch}
              alt=""
              className={styles.searchIcon}
            />

            <input
              type="text"
              className={styles.searchInput}
              placeholder="싫어하는 음식을 입력해주세요."
              value={inputValue}
              onChange={(event) =>
                setInputValue(event.target.value)
              }
              onKeyDown={handleInputKeyDown}
            />
          </div>

          {customTags.length > 0 && (
            <div className={styles.tagRow}>
              {customTags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  <button
                    type="button"
                    className={styles.tagClose}
                    onClick={() => removeTag(tag)}
                    aria-label={`${tag} 삭제`}
                  >
                    <img
                      src={iconCloseSmall}
                      alt=""
                      className={styles.tagCloseIcon}
                    />
                  </button>

                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
}