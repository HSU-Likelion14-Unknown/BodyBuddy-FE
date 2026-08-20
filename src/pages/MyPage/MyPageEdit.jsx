import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { patchMe } from '@/api/user';
import { MdBorderColor, MdEdit } from 'react-icons/md';
import styles from './MyPageEdit.module.scss';
import {
  profileChracter,
  mypageIconAllergy,
  mypageIconDislike,
  iconSearch,
  iconCloseSmall,
} from '@/assets';

const ALLERGEN_OPTIONS = [
  { key: 'none', label: '없음' },
  { key: 'egg', label: '계란' },
  { key: 'milk', label: '우유' },
  { key: 'nuts', label: '견과류' },
  { key: 'shellfish', label: '갑각류' },
  { key: 'soy', label: '대두' },
  { key: 'wheat', label: '밀' },
];

const GENDER_LABEL = { male: '남성', female: '여성', none: '상관 없음' };

function Toggle({ checked, onChange }) {
  return (
    <label className={styles.toggle}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span
        className={`${styles.toggleTrack} ${checked ? styles.toggleTrackOn : ''}`}
      >
        <span className={styles.toggleKnob} />
      </span>
    </label>
  );
}

export default function MyPageEdit() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const step1 = JSON.parse(localStorage.getItem('onboarding_step1') || 'null');
  const step2 = JSON.parse(localStorage.getItem('onboarding_step2') || 'null');
  const step3 = JSON.parse(localStorage.getItem('onboarding_step3') || 'null');
  const savedSettings = JSON.parse(
    localStorage.getItem('mypage_settings') || 'null',
  );

  const initialNickname = step1?.nickname || '';
  const initialAllergens = step2?.allergens || [];
  const initialCustomAllergens = step2?.customAllergens || [];
  const initialDislikedFoods = step3?.noDisliked
    ? []
    : step3?.dislikedFoods || [];
  const initialShareRecords = savedSettings?.shareRecords ?? false;

  const birthYear = step1?.birthYear;
  const gender = step1?.gender;

  const [nickname, setNickname] = useState(initialNickname);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [allergens, setAllergens] = useState(initialAllergens);
  const [customAllergens, setCustomAllergens] = useState(
    initialCustomAllergens,
  );
  const [dislikedFoods, setDislikedFoods] = useState(initialDislikedFoods);
  const [shareRecords, setShareRecords] = useState(initialShareRecords);
  const [allergenInput, setAllergenInput] = useState('');
  const [dislikedInput, setDislikedInput] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const nicknameChanged = nickname !== initialNickname;
  const nicknameValid =
    !nicknameChanged ||
    (nickname.trim().length >= 1 && nickname.trim().length <= 7);

  const hasChanges =
    nickname !== initialNickname ||
    profilePhoto !== null ||
    JSON.stringify([...allergens].sort()) !==
      JSON.stringify([...initialAllergens].sort()) ||
    JSON.stringify([...customAllergens].sort()) !==
      JSON.stringify([...initialCustomAllergens].sort()) ||
    JSON.stringify([...dislikedFoods].sort()) !==
      JSON.stringify([...initialDislikedFoods].sort()) ||
    shareRecords !== initialShareRecords;

  const canSave = hasChanges && nicknameValid && !saveSuccess;

  const toggleAllergen = (key) => {
    if (key === 'none') {
      setAllergens(['none']);
    } else {
      setAllergens((prev) => {
        const withoutNone = prev.filter((v) => v !== 'none');
        if (withoutNone.includes(key)) {
          return withoutNone.filter((v) => v !== key);
        }
        return [...withoutNone, key];
      });
    }
  };

  const addCustomAllergen = () => {
    const val = allergenInput.trim();
    if (val && !customAllergens.includes(val)) {
      setCustomAllergens((prev) => [...prev, val]);
      setAllergenInput('');
    }
  };

  const addDisliked = () => {
    const val = dislikedInput.trim();
    if (val && !dislikedFoods.includes(val)) {
      setDislikedFoods((prev) => [...prev, val]);
      setDislikedInput('');
    }
  };

  const handleSave = async () => {
    if (!canSave) return;

    try {
      await patchMe({
        nickname: nickname.trim(),
        birthYear,
        gender,
        allergens,
        customAllergens,
        dislikedFoods,
        shareToRoom: shareRecords,
      });

      setSaveSuccess(true);
      setTimeout(() => navigate('/mypage'), 3000);
    } catch (e) {
      console.error('저장 실패:', e);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePhoto(url);
      e.target.value = '';
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.profileSection}>
        <div className={styles.avatarArea}>
          <div className={styles.avatarBg} />
          <img
            src={profilePhoto || profileChracter}
            alt=""
            className={styles.avatarImg}
          />
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => fileInputRef.current?.click()}
          >
            <MdEdit className={styles.editIcon} />
          </button>
        </div>

        <div className={styles.nicknameRow}>
          {isEditingNickname ? (
            <input
              className={styles.nicknameInput}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={7}
              autoFocus
              onBlur={() => setIsEditingNickname(false)}
              onKeyDown={(e) =>
                e.key === 'Enter' && setIsEditingNickname(false)
              }
            />
          ) : (
            <span className={styles.nickname}>{nickname || '닉네임'}</span>
          )}
          {!isEditingNickname && (
            <button
              type="button"
              className={styles.editNicknameBtn}
              onClick={() => setIsEditingNickname(true)}
            >
              <MdBorderColor className={styles.editNicknameIcon} />
            </button>
          )}
        </div>

        {(birthYear || gender) && (
          <p className={styles.userInfo}>
            {birthYear && <span>{birthYear}년</span>}
            {gender && <span>{GENDER_LABEL[gender]}</span>}
          </p>
        )}
      </section>

      <div className={styles.formSection}>
        <div className={styles.formInner}>
          <div className={styles.editCard}>
            <div className={styles.allergenSection}>
              <div className={styles.sectionLabelRow}>
                <img
                  src={mypageIconAllergy}
                  alt=""
                  className={styles.sectionIconSm}
                />
                <span className={styles.sectionLabel}>알레르기</span>
              </div>
              <div className={styles.pillArea}>
                {ALLERGEN_OPTIONS.map((opt) => (
                  <>
                    <button
                      key={opt.key}
                      type="button"
                      className={`${styles.pill} ${allergens.includes(opt.key) ? styles.pillSelected : ''}`}
                      onClick={() => toggleAllergen(opt.key)}
                    >
                      {opt.label}
                    </button>
                    {opt.key === 'nuts' && (
                      <div key="break" className={styles.pillBreak} />
                    )}
                  </>
                ))}
              </div>
              <div className={styles.searchArea}>
                <div className={styles.searchBox}>
                  <img src={iconSearch} alt="" className={styles.searchIcon} />
                  <input
                    className={styles.searchInput}
                    placeholder="외에 알레르기를 입력해주세요."
                    value={allergenInput}
                    onChange={(e) => setAllergenInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing)
                        addCustomAllergen();
                    }}
                  />
                </div>
                <div className={styles.customTagList}>
                  {customAllergens.map((tag) => (
                    <div key={tag} className={styles.customTag}>
                      <button
                        type="button"
                        className={styles.customTagClose}
                        onClick={() =>
                          setCustomAllergens((prev) =>
                            prev.filter((v) => v !== tag),
                          )
                        }
                      >
                        <img
                          src={iconCloseSmall}
                          alt=""
                          className={styles.closeIcon}
                        />
                      </button>
                      <span className={styles.customTagLabel}>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.dislikedSection}>
              <div className={styles.sectionLabelRow}>
                <img
                  src={mypageIconDislike}
                  alt=""
                  className={styles.sectionIcon}
                />
                <span className={styles.sectionLabel}>비선호 음식</span>
              </div>
              <div className={styles.dislikedContent}>
                <div className={styles.searchBox}>
                  <img src={iconSearch} alt="" className={styles.searchIcon} />
                  <input
                    className={styles.searchInput}
                    placeholder="싫어하는 음식을 입력해주세요."
                    value={dislikedInput}
                    onChange={(e) => setDislikedInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing)
                        addDisliked();
                    }}
                  />
                </div>
                <div className={styles.customTagList}>
                  {dislikedFoods.map((tag) => (
                    <div key={tag} className={styles.customTag}>
                      <button
                        type="button"
                        className={styles.customTagClose}
                        onClick={() =>
                          setDislikedFoods((prev) =>
                            prev.filter((v) => v !== tag),
                          )
                        }
                      >
                        <img
                          src={iconCloseSmall}
                          alt=""
                          className={styles.closeIcon}
                        />
                      </button>
                      <span className={styles.customTagLabel}>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.shareRow}>
            <span className={styles.shareLabel}>
              내 기록 친구방에 항상 공유
            </span>
            <Toggle
              checked={shareRecords}
              onChange={() => setShareRecords((v) => !v)}
            />
          </div>
        </div>

        <button
          type="button"
          className={`${styles.saveBtn} ${canSave ? styles.saveBtnActive : ''} ${saveSuccess ? styles.saveBtnSuccess : ''}`}
          onClick={handleSave}
        >
          {saveSuccess ? '저장되었어요!' : '변경사항 저장'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoSelect}
      />
    </div>
  );
}
