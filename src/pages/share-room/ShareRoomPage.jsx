import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  shareRoomAddIcon,
  shareRoomAddWhiteIcon,
  shareRoomBackIcon,
  shareRoomCover,
  shareRoomInviteDecoration,
  shareRoomLogoutIcon,
  shareRoomMoreIcon,
  shareRoomPhotoIcon,
} from '@/assets';
import InviteDialog from './components/InviteDialog';
import MemberRecordCard from './components/MemberRecordCard';
import {
  EMPTY_MEMBERS,
  INITIAL_MEMBERS,
  RECORDED_MEMBERS,
} from './shareRoomMock';
import styles from './ShareRoomPage.module.scss';

const VIEW_MEMBERS = {
  initial: INITIAL_MEMBERS,
  empty: EMPTY_MEMBERS,
  records: RECORDED_MEMBERS,
};

export default function ShareRoomPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const fileInputRef = useRef(null);
  const coverObjectUrlRef = useRef('');

  const viewFromQuery = new URLSearchParams(location.search).get('view');
  const requestedView = location.state?.view || viewFromQuery;
  const view = VIEW_MEMBERS[requestedView] ? requestedView : 'records';
  const members = VIEW_MEMBERS[view];
  const roomName = location.state?.roomName || '알수없음조';
  const isInitial = view === 'initial';
  const coverImageUrl = customCoverUrl || (!isInitial ? shareRoomCover : '');

  useEffect(
    () => () => {
      if (coverObjectUrlRef.current) {
        URL.revokeObjectURL(coverObjectUrlRef.current);
      }
    },
    [],
  );

  const openInviteDialog = () => {
    setIsMenuOpen(false);
    setIsInviteOpen(true);
  };

  const openCoverPicker = () => {
    setIsMenuOpen(false);
    fileInputRef.current?.click();
  };

  const changeCoverImage = (event) => {
    const [file] = event.target.files;

    if (!file) return;

    if (coverObjectUrlRef.current) {
      URL.revokeObjectURL(coverObjectUrlRef.current);
    }

    const nextCoverUrl = URL.createObjectURL(file);
    coverObjectUrlRef.current = nextCoverUrl;
    setCustomCoverUrl(nextCoverUrl);
    event.target.value = '';
  };

  return (
    <main
      className={`${styles.container} ${view === 'records' ? styles.recordsView : ''}`}
    >
      <header
        className={`${styles.coverHeader} ${isInitial ? styles.initial : ''}`}
      >
        {coverImageUrl && (
          <img className={styles.coverImage} src={coverImageUrl} alt="" />
        )}
        <div className={styles.coverGradient} />

        <button
          type="button"
          className={styles.backButton}
          title="홈으로 가기"
          onClick={() => navigate('/home')}
        >
          <img src={shareRoomBackIcon} alt="" />
        </button>

        <button
          type="button"
          className={styles.moreButton}
          title="공유방 메뉴"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <img src={shareRoomMoreIcon} alt="" />
        </button>

        <h1>{roomName}</h1>

        {isMenuOpen && (
          <>
            <button
              type="button"
              className={styles.menuBackdrop}
              title="메뉴 닫기"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className={styles.roomMenu}>
              <div className={styles.menuGroup}>
                <button type="button" onClick={openInviteDialog}>
                  친구 초대하기
                  <span className={styles.menuIcon}>
                    <img src={shareRoomAddIcon} alt="" />
                  </span>
                </button>
                <span className={styles.menuDivider} />
                <button type="button" onClick={() => navigate('/home')}>
                  나가기
                  <span className={styles.menuIcon}>
                    <img src={shareRoomLogoutIcon} alt="" />
                  </span>
                </button>
              </div>

              <div className={styles.menuGroup}>
                <span className={styles.menuDivider} />
                <button type="button" onClick={openCoverPicker}>
                  홈 꾸미기
                  <span className={styles.menuIcon}>
                    <img src={shareRoomPhotoIcon} alt="" />
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </header>

      <section className={styles.memberList}>
        {members.map((member) => (
          <MemberRecordCard key={`${view}-${member.id}`} member={member} />
        ))}
      </section>

      {isInitial && (
        <section className={styles.inviteContent}>
          <img src={shareRoomInviteDecoration} alt="" />
          <div className={styles.inviteMessage}>
            <strong>친구를 초대해 보세요.</strong>
            <span>많은 친구들과 기록을 공유해 봐요!</span>
          </div>
          <button type="button" onClick={openInviteDialog}>
            <span className={styles.inviteButtonIcon}>
              <img src={shareRoomAddWhiteIcon} alt="" />
            </span>
            초대 링크 공유하기
          </button>
        </section>
      )}

      <input
        ref={fileInputRef}
        className={styles.coverInput}
        type="file"
        accept="image/*"
        onChange={changeCoverImage}
      />

      {isInviteOpen && (
        <InviteDialog
          inviteCode="BODY26"
          roomName={roomName}
          onClose={() => setIsInviteOpen(false)}
        />
      )}
    </main>
  );
}
