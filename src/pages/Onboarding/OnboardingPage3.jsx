import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { putOnboarding } from '@/api/user';
import { useNetworkRequest } from '@/hooks/useNetworkRequest';
import { setOnboardingCompletedAt } from '@/api/userStorage';
import styles from './OnboardingPage3.module.scss';
import { onboardingCharacter3, iconSearch, iconCloseSmall } from '@/assets';
import OnboardingLayout from './components/OnboardingLayout';

export default function OnboardingPage3() {
  const navigate = useNavigate();
  const saved = JSON.parse(localStorage.getItem('onboarding_step3') || 'null');
  const [isNone, setIsNone] = useState(saved ? saved.noDisliked : true);
  const [inputValue, setInputValue] = useState('');
  const [customTags, setCustomTags] = useState(saved?.dislikedFoods || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const networkRequest = useNetworkRequest();

  const isNextEnabled = (isNone || customTags.length > 0) && !isSubmitting;

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
      const next = prev.filter((t) => t !== text);
      if (next.length === 0) setIsNone(true);
      return next;
    });
  }, []);

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) addTag(inputValue);
  };

  const handleBack = () => {
    localStorage.setItem(
      'onboarding_step3',
      JSON.stringify({ noDisliked: isNone, dislikedFoods: customTags }),
    );
    localStorage.setItem('onboarding_prev_step', '3');
    navigate(-1);
  };

  const handleNext = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    localStorage.setItem(
      'onboarding_step3',
      JSON.stringify({ noDisliked: isNone, dislikedFoods: customTags }),
    );

    const step1 = JSON.parse(localStorage.getItem('onboarding_step1') || '{}');
    const step2 = JSON.parse(localStorage.getItem('onboarding_step2') || '{}');

    try {
      const result = await networkRequest(() => putOnboarding({
        nickname: step1.nickname,
        birthYear: step1.birthYear ?? null,
        gender: step1.gender ?? 'none',
        allergens: step2.allergens ?? [],
        customAllergens: step2.customAllergens ?? [],
        dislikedFoods: isNone ? [] : customTags,
      }));

      if (result?.onboardingCompletedAt) {
        setOnboardingCompletedAt(result.onboardingCompletedAt);
      }

      navigate('/home');
    } catch (e) {
      console.error('온보딩 저장 실패:', e);
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
        {/* 없어요. 버튼 */}
        <div className={styles.noneSection}>
          <button
            type="button"
            className={`${styles.noneBtn} ${isNone ? styles.noneBtnActive : ''}`}
            onClick={handleNoneClick}
          >
            없어요.
          </button>
        </div>

        {/* or 구분자 */}
        <p className={styles.orDivider}>or</p>

        {/* 직접 입력 영역 */}
        <div className={styles.inputSection}>
          <div className={styles.searchWrap}>
            <img src={iconSearch} alt="" className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="싫어하는 음식을 입력해주세요."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
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
