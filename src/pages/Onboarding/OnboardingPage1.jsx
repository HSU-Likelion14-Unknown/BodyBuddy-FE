import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OnboardingPage1.module.scss';
import {
  onboardingCharacter1,
  iconChevronDown,
  iconMale,
  iconFemale,
  iconCheckEmpty,
  iconCheckFilled,
} from '@/assets';
import OnboardingLayout from './components/OnboardingLayout';
import YearPicker from '@/components/common/YearPicker/YearPicker';
import Toast from '@/components/common/Toast/Toast';

const GENDER_OPTIONS = [
  { value: 'male', label: '남성', icon: iconMale },
  { value: 'female', label: '여성', icon: iconFemale },
  { value: 'none', label: '상관 없음', icon: null },
];

export default function OnboardingPage1() {
  const navigate = useNavigate();

  const saved = JSON.parse(localStorage.getItem('onboarding_step1') || 'null');
  const [nickname, setNickname] = useState(saved?.nickname || '');
  const [nicknameError, setNicknameError] = useState('');
  const [birthYear, setBirthYear] = useState(saved?.birthYear || null);
  const [gender, setGender] = useState(saved?.gender || 'male');
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const isNicknameValid =
    nickname.trim().length >= 1 && nickname.trim().length <= 7;
  const isNextEnabled = isNicknameValid && !nicknameError && birthYear !== null;

  const handleNicknameChange = (e) => {
    const val = e.target.value;
    setNickname(val);
    setNicknameError(val.length > 7 ? '1 ~ 7자 사이로 입력해주세요.' : '');
  };

  const handleGenderSelect = useCallback((value) => {
    setGender(value);
    if (value === 'none') setShowToast(true);
  }, []);

  const handleHideToast = useCallback(() => setShowToast(false), []);

  const handleNext = () => {
    // TODO: POST /api/users/profile
    localStorage.setItem(
      'onboarding_step1',
      JSON.stringify({ nickname: nickname.trim(), birthYear, gender }),
    );
    navigate('/onboarding/2');
  };

  return (
    <>
      <OnboardingLayout
        step={1}
        image={onboardingCharacter1}
        title={
          <>
            환영합니다!
            <br />
            회원님의 정보를 알려주세요.
          </>
        }
        isNextEnabled={isNextEnabled}
        onNext={handleNext}
      >
        {/* 닉네임 */}
        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            닉네임
            <img
              src={isNicknameValid ? iconCheckFilled : iconCheckEmpty}
              alt=""
              className={styles.check}
            />
            {nicknameError && (
              <span className={styles.errorText}>{nicknameError}</span>
            )}
          </label>
          <input
            type="text"
            className={`${styles.input} ${nicknameError ? styles.inputError : ''} ${nickname && !nicknameError ? styles.inputActive : ''}`}
            placeholder="1 ~ 7자 사이로 입력해주세요."
            value={nickname}
            onChange={handleNicknameChange}
          />
        </div>

        {/* 출생연도 */}
        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            출생연도
            <img
              src={birthYear ? iconCheckFilled : iconCheckEmpty}
              alt=""
              className={styles.check}
            />
          </label>
          <button
            type="button"
            className={`${styles.yearTrigger} ${birthYear ? styles.yearTriggerActive : ''}`}
            onClick={() => setShowYearPicker(true)}
          >
            <span
              className={birthYear ? styles.yearValue : styles.yearPlaceholder}
            >
              {birthYear ?? '연도 선택'}
            </span>
            <img src={iconChevronDown} alt="" className={styles.chevron} />
          </button>
        </div>

        {/* 성별 */}
        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            성별
            <img src={iconCheckFilled} alt="" className={styles.check} />
          </label>
          <div className={styles.genderRow}>
            {GENDER_OPTIONS.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                className={`${styles.genderBtn} ${gender === value ? styles.genderBtnActive : ''}`}
                onClick={() => handleGenderSelect(value)}
              >
                {label}
                {icon && (
                  <img src={icon} alt="" className={styles.genderIcon} />
                )}
              </button>
            ))}
          </div>
        </div>
      </OnboardingLayout>

      {showYearPicker && (
        <YearPicker
          value={birthYear}
          onChange={setBirthYear}
          onClose={() => setShowYearPicker(false)}
        />
      )}

      <Toast
        message="추천 결과가 정확하지 않을 수 있어요"
        visible={showToast}
        onHide={handleHideToast}
      />
    </>
  );
}
