import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, patchMe, patchProfileImage } from '@/api/user';
import { useNetworkRequest } from '@/hooks/useNetworkRequest';
import { MdBorderColor, MdEdit, MdCheck } from 'react-icons/md';
import YearPicker from '../Onboarding/components/YearPicker';
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
const REVERSE_GENDER_MAP = {
  MALE: 'male',
  FEMALE: 'female',
  PREFER_NOT_TO_SAY: 'none',
};

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

  const [birthYear, setBirthYear] = useState(step1?.birthYear ?? null);
  const [gender, setGender] = useState(step1?.gender ?? null);
  const [origBirthYear, setOrigBirthYear] = useState(step1?.birthYear ?? null);
  const [origGender, setOrigGender] = useState(step1?.gender ?? null);

  const [nickname, setNickname] = useState(initialNickname);
  const [isEditing, setIsEditing] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [allergens, setAllergens] = useState(initialAllergens);
  const [customAllergens, setCustomAllergens] = useState(
    initialCustomAllergens,
  );
  const [dislikedFoods, setDislikedFoods] = useState(initialDislikedFoods);
  const [shareRecords, setShareRecords] = useState(initialShareRecords);
  const [origShareRecords, setOrigShareRecords] = useState(initialShareRecords);
  const [allergenInput, setAllergenInput] = useState('');
  const [dislikedInput, setDislikedInput] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [serverProfileImageUrl, setServerProfileImageUrl] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const networkRequest = useNetworkRequest();

  useEffect(() => {
    networkRequest(() => getMe()).then((data) => {
      if (!data) return;
      if (data.profileImageUrl) setServerProfileImageUrl(data.profileImageUrl);
      if (data.birthYear) {
        setBirthYear(data.birthYear);
        setOrigBirthYear(data.birthYear);
      }
      if (data.gender) {
        const fg = REVERSE_GENDER_MAP[data.gender] ?? null;
        setGender(fg);
        setOrigGender(fg);
      }
      if (data.shareToRoom != null) {
        setShareRecords(data.shareToRoom);
        setOrigShareRecords(data.shareToRoom);
      }
    });
  }, [networkRequest]);

  const nicknameChanged = nickname !== initialNickname;
  const nicknameValid =
    !nicknameChanged ||
    (nickname.trim().length >= 1 && nickname.trim().length <= 7);

  const hasChanges =
    nickname !== initialNickname ||
    birthYear !== origBirthYear ||
    gender !== origGender ||
    profilePhoto !== null ||
    JSON.stringify([...allergens].sort()) !==
      JSON.stringify([...initialAllergens].sort()) ||
    JSON.stringify([...customAllergens].sort()) !==
      JSON.stringify([...initialCustomAllergens].sort()) ||
    JSON.stringify([...dislikedFoods].sort()) !==
      JSON.stringify([...initialDislikedFoods].sort()) ||
    shareRecords !== origShareRecords;

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
      await networkRequest(() =>
        patchMe({
          nickname: nickname.trim(),
          birthYear,
          gender,
          allergens,
          customAllergens,
          dislikedFoods,
          shareToRoom: shareRecords,
        }),
      );

      setSaveSuccess(true);
      setTimeout(() => navigate('/mypage'), 3000);
    } catch (e) {
      console.error('저장 실패:', e);
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setProfilePhoto(previewUrl);
    e.target.value = '';

    try {
      await networkRequest(() => patchProfileImage(file));
    } catch (err) {
      console.error('프로필 사진 업로드 실패:', err);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.profileSection}>
        <div className={styles.avatarArea}>
          {!profilePhoto && !serverProfileImageUrl && (
            <div className={styles.avatarBg} />
          )}
          <img
            src={profilePhoto || serverProfileImageUrl || profileChracter}
            alt=""
            className={`${styles.avatarImg} ${profilePhoto || serverProfileImageUrl ? styles.avatarImgFilled : ''}`}
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
          {isEditing ? (
            <input
              className={styles.nicknameInput}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={7}
              autoFocus
            />
          ) : (
            <span className={styles.nickname}>{nickname || '닉네임'}</span>
          )}
          <button
            type="button"
            className={styles.editNicknameBtn}
            onClick={() => setIsEditing((v) => !v)}
          >
            {isEditing ? (
              <MdCheck className={styles.editNicknameIcon} />
            ) : (
              <MdBorderColor className={styles.editNicknameIcon} />
            )}
          </button>
        </div>

        {isEditing ? (
          <p className={styles.userInfo}>
            <button
              type="button"
              className={styles.infoEditBtn}
              onClick={() => setShowYearPicker(true)}
            >
              {birthYear ? `${birthYear}년` : '출생연도'}
            </button>
            <select
              className={styles.infoEditSelect}
              value={gender ?? ''}
              onChange={(e) => setGender(e.target.value || null)}
            >
              <option value="" disabled>
                성별
              </option>
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="none">상관 없음</option>
            </select>
          </p>
        ) : (
          (birthYear || gender) && (
            <p className={styles.userInfo}>
              {birthYear && <span>{birthYear}년</span>}
              {gender && <span>{GENDER_LABEL[gender]}</span>}
            </p>
          )
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
                  <React.Fragment key={opt.key}>
                    <button
                      type="button"
                      className={`${styles.pill} ${allergens.includes(opt.key) ? styles.pillSelected : ''}`}
                      onClick={() => toggleAllergen(opt.key)}
                    >
                      {opt.label}
                    </button>
                    {opt.key === 'nuts' && <div className={styles.pillBreak} />}
                  </React.Fragment>
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

      {showYearPicker && (
        <YearPicker
          value={birthYear}
          onChange={(year) => setBirthYear(year)}
          onClose={() => setShowYearPicker(false)}
        />
      )}
    </div>
  );
}
