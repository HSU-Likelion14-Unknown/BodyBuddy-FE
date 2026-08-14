import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OnboardingPage2.module.scss';
import { onboardingCharacter2, iconSearch, iconCloseSmall } from '@/assets';
import OnboardingLayout from './components/OnboardingLayout';

const ALLERGEN_OPTIONS = [
  { value: 'none', label: '없음' },
  { value: 'egg', label: '계란' },
  { value: 'milk', label: '우유' },
  { value: 'nuts', label: '견과류' },
  { value: 'shellfish', label: '갑각류' },
  { value: 'soy', label: '대두' },
  { value: 'wheat', label: '밀' },
];

export default function OnboardingPage2() {
  const navigate = useNavigate();
  const saved = JSON.parse(localStorage.getItem('onboarding_step2') || 'null');
  const [selected, setSelected] = useState(() => {
    if (saved?.allergens?.length) return new Set(saved.allergens);
    return new Set(['none']);
  });
  const [inputValue, setInputValue] = useState('');
  const [customTags, setCustomTags] = useState(saved?.customAllergens || []);

  const isNextEnabled = selected.size > 0 || customTags.length > 0;

  const handleToggle = useCallback((value) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (value === 'none') return new Set(['none']);
      next.delete('none');
      if (next.has(value)) {
        next.delete(value);
        if (next.size === 0) return new Set(['none']);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);

  const addTag = (text) => {
    const trimmed = text.trim();
    if (!trimmed || customTags.includes(trimmed)) {
      setInputValue('');
      return;
    }
    setCustomTags((prev) => [...prev, trimmed]);
    setSelected((prev) => {
      if (prev.size === 1 && prev.has('none')) return new Set();
      return prev;
    });
    setInputValue('');
  };

  const removeTag = useCallback((text) => {
    setCustomTags((prev) => {
      const next = prev.filter((t) => t !== text);
      if (next.length === 0) {
        setSelected((s) => (s.size === 0 ? new Set(['none']) : s));
      }
      return next;
    });
  }, []);

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) addTag(inputValue);
  };

  const handleBack = () => {
    localStorage.setItem(
      'onboarding_step2',
      JSON.stringify({ allergens: [...selected], customAllergens: customTags }),
    );
    navigate(-1);
  };

  const handleNext = () => {
    // TODO: POST /api/users/allergies
    localStorage.setItem(
      'onboarding_step2',
      JSON.stringify({
        allergens: [...selected],
        customAllergens: customTags,
      }),
    );
    navigate('/onboarding/3');
  };

  return (
    <OnboardingLayout
      step={2}
      image={onboardingCharacter2}
      title={
        <>
          안전한 추천을 위해
          <br />
          알레르기를 알려 주세요.
        </>
      }
      subtitle="복수 선택 가능"
      isNextEnabled={isNextEnabled}
      onBack={handleBack}
      onNext={handleNext}
    >
      {/* 알레르기 선택 그리드 */}
      <div className={styles.allergenGrid}>
        {ALLERGEN_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`${styles.allergenBtn} ${selected.has(value) ? styles.allergenBtnActive : ''}`}
            onClick={() => handleToggle(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 직접 입력 영역 */}
      <div className={styles.inputSection}>
        <div className={styles.searchWrap}>
          <img src={iconSearch} alt="" className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="외에 알레르기를 입력해주세요."
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
    </OnboardingLayout>
  );
}
