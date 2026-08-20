import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, deleteMe } from '@/api/user';
import { useNetworkRequest } from '@/hooks/useNetworkRequest';
import { MdEdit } from 'react-icons/md';
import { VscChevronRight } from 'react-icons/vsc';
import styles from './MyPage.module.scss';
import {
  profileChracter,
  mypageIconAllergy,
  mypageIconDislike,
} from '@/assets';

const ALLERGEN_LABEL = {
  EGG: '계란',
  MILK: '우유',
  NUTS: '견과류',
  SHELLFISH: '갑각류',
  SOY: '대두',
  WHEAT: '밀',
};

const GENDER_LABEL = {
  MALE: '남성',
  FEMALE: '여성',
  PREFER_NOT_TO_SAY: '상관 없음',
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

export default function MyPage() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('닉네임');
  const [birthYear, setBirthYear] = useState(null);
  const [gender, setGender] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [allAllergens, setAllAllergens] = useState([]);
  const [dislikedFoods, setDislikedFoods] = useState([]);
  const [notifOn, setNotifOn] = useState(true);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const fetched = useRef(false);
  const networkRequest = useNetworkRequest();

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    const step2 = JSON.parse(
      localStorage.getItem('onboarding_step2') || 'null',
    );
    const step3 = JSON.parse(
      localStorage.getItem('onboarding_step3') || 'null',
    );

    networkRequest(() => getMe()).then((data) => {
      if (!data) return;
      if (data.nickname) setNickname(data.nickname);
      if (data.birthYear) setBirthYear(data.birthYear);
      if (data.gender) setGender(data.gender);
      if (data.profileImageUrl) setProfileImageUrl(data.profileImageUrl);

      if (data.allergyCodes) {
        setAllAllergens(data.allergyCodes.map((c) => ALLERGEN_LABEL[c] || c));
      } else {
        const mapped = (step2?.allergens || [])
          .filter((v) => v !== 'none')
          .map((v) => ALLERGEN_LABEL[v.toUpperCase()] || v);
        setAllAllergens([...mapped, ...(step2?.customAllergens || [])]);
      }

      if (data.dislikedFoods) {
        setDislikedFoods(data.dislikedFoods);
      } else {
        setDislikedFoods(step3?.noDisliked ? [] : step3?.dislikedFoods || []);
      }
    });
  }, [networkRequest]);

  return (
    <div className={styles.page}>
      {/* 프로필 */}
      <section className={styles.profileSection}>
        <div className={styles.avatarArea}>
          {!profileImageUrl && <div className={styles.avatarBg} />}
          <img
            src={profileImageUrl || profileChracter}
            alt=""
            className={`${styles.avatarImg} ${profileImageUrl ? styles.avatarImgFilled : ''}`}
          />
        </div>
        <h1 className={styles.nickname}>{nickname}</h1>
        {(birthYear || gender) && (
          <p className={styles.userInfo}>
            {birthYear && <span>{birthYear}년</span>}
            {gender && <span>{GENDER_LABEL[gender]}</span>}
          </p>
        )}
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
      </section>

      {/* 정보 */}
      <section className={styles.settingsSection}>
        <h2 className={styles.sectionHeader}>정보</h2>
        <button
          type="button"
          className={`${styles.settingRow} ${styles.settingRowCompact}`}
          onClick={() => setShowDeleteSheet(true)}
        >
          <span className={styles.settingLabel}>회원탈퇴</span>
          <VscChevronRight className={styles.chevron} />
        </button>
        <hr className={styles.divider} />
      </section>

      <footer className={styles.dataSource}>
        <p className={styles.dataSourceLabel}>영양성분 데이터 출처</p>
        <p>식품영양성분 데이터베이스</p>
        <p lang="en">Korean Food Composition Database system(K-FCDB)</p>
      </footer>

      {showDeleteSheet && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setShowDeleteSheet(false)}
          />
          <div className={styles.bottomSheet}>
            <p className={styles.sheetTitle}>정말 탈퇴하시겠어요?</p>
            <p className={styles.sheetDesc}>
              탈퇴하면 모든 정보가 삭제되며 복구할 수 없어요.
            </p>
            <button
              type="button"
              className={styles.sheetDeleteBtn}
              onClick={async () => {
                try {
                  await deleteMe();
                  localStorage.clear();
                  navigate('/', { replace: true });
                } catch (e) {
                  console.error('탈퇴 실패:', e);
                }
              }}
            >
              탈퇴하기
            </button>
            <button
              type="button"
              className={styles.sheetCancelBtn}
              onClick={() => setShowDeleteSheet(false)}
            >
              취소
            </button>
          </div>
        </>
      )}
    </div>
  );
}
