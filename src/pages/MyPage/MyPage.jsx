import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEdit } from 'react-icons/md';
import { VscChevronRight } from 'react-icons/vsc';
import styles from './MyPage.module.scss';
import { profileChracter, mypageIconAllergy, mypageIconDislike } from '@/assets';

const ALLERGEN_LABEL = {
  egg: '계란',
  milk: '우유',
  nuts: '견과류',
  shellfish: '갑각류',
  soy: '대두',
  wheat: '밀',
};

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

export default function MyPage() {
  const navigate = useNavigate();

  const step1 = JSON.parse(localStorage.getItem('onboarding_step1') || 'null');
  const step2 = JSON.parse(localStorage.getItem('onboarding_step2') || 'null');
  const step3 = JSON.parse(localStorage.getItem('onboarding_step3') || 'null');

  const nickname = step1?.nickname || '닉네임';
  const birthYear = step1?.birthYear;
  const gender = step1?.gender;

  const allergens = (step2?.allergens || [])
    .filter((v) => v !== 'none')
    .map((v) => ALLERGEN_LABEL[v] || v);
  const customAllergens = step2?.customAllergens || [];
  const allAllergens = [...allergens, ...customAllergens];

  const dislikedFoods = step3?.noDisliked ? [] : step3?.dislikedFoods || [];

  const [notifOn, setNotifOn] = useState(true);
  const [marketingOn, setMarketingOn] = useState(false);

  const infoText = [birthYear ? `${birthYear}년` : null, GENDER_LABEL[gender]]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.page}>
      {/* 프로필 */}
      <section className={styles.profileSection}>
        <div className={styles.avatarArea}>
          <div className={styles.avatarBg} />
          <img src={profileChracter} alt="" className={styles.avatarImg} />
        </div>
        <h1 className={styles.nickname}>{nickname}</h1>
        {infoText && <p className={styles.userInfo}>{infoText}</p>}
        <button
          type="button"
          className={styles.editBtn}
          onClick={() => navigate('/mypage/edit')}
        >
          내 정보 수정
          <MdEdit className={styles.editIcon} />
        </button>
      </section>

      {/* 알레르기 & 비선호 음식 카드 */}
      <div className={styles.infoCard}>
        <div className={styles.infoHalf}>
          <div className={styles.infoLabelRow}>
            <img src={mypageIconAllergy} alt="" className={styles.infoIcon} />
            <span className={styles.infoLabel}>알레르기</span>
          </div>
          <div className={styles.tagList}>
            {allAllergens.length > 0 ? (
              allAllergens.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))
            ) : (
              <span className={styles.tag}>없음</span>
            )}
          </div>
        </div>
        <div className={styles.infoDivider} />
        <div className={styles.infoHalf}>
          <div className={styles.infoLabelRow}>
            <img src={mypageIconDislike} alt="" className={styles.infoIcon} />
            <span className={styles.infoLabel}>비선호 음식</span>
          </div>
          <div className={styles.tagList}>
            {dislikedFoods.length > 0 ? (
              dislikedFoods.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))
            ) : (
              <span className={styles.tag}>없음</span>
            )}
          </div>
        </div>
      </div>

      {/* 이벤트 및 알림 */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionHeader}>이벤트 및 알림</h2>
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>알림</span>
          <Toggle checked={notifOn} onChange={() => setNotifOn((v) => !v)} />
        </div>
        <hr className={styles.divider} />
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>마케팅 수신 동의</span>
          <Toggle
            checked={marketingOn}
            onChange={() => setMarketingOn((v) => !v)}
          />
        </div>
        <hr className={styles.divider} />
      </section>

      {/* 정보 */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionHeader}>정보</h2>
        <button type="button" className={`${styles.settingRow} ${styles.settingRowCompact}`}>
          <span className={styles.settingLabel}>회원탈퇴</span>
          <VscChevronRight className={styles.chevron} />
        </button>
        <hr className={styles.divider} />
      </section>
    </div>
  );
}
