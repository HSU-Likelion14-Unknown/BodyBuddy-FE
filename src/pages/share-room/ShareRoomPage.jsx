import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
import { getApiErrorMessage } from '@/api/error';
import { leaveRoom, updateRoomCover } from '@/api/rooms';
import InviteDialog from './components/InviteDialog';
import MemberRecordCard from './components/MemberRecordCard';
import { useRoomFeed } from './hooks/useRoomFeed';
import styles from './ShareRoomPage.module.scss';

export default function ShareRoomPage() {
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [menuErrorMessage, setMenuErrorMessage] = useState('');
  const [isLeaving, setIsLeaving] = useState(false);
  const fileInputRef = useRef(null);
  const coverObjectUrlRef = useRef('');

  const { members, isLoading, errorMessage } = useRoomFeed(roomId);
  const roomName = location.state?.roomName || '공유방';
  // 나 혼자면 초대 유도 화면, 기록이 하나라도 있으면 기록 화면
  const isInitial = !isLoading && members.length <= 1;
  const hasRecords = members.some((member) => member.records.length > 0);
  const view = hasRecords ? 'records' : 'empty';
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

  const changeCoverImage = async (event) => {
    const [file] = event.target.files;

    event.target.value = '';

    if (!file || !roomId) return;

    // 업로드가 끝나기 전에도 고른 사진을 먼저 보여줌
    if (coverObjectUrlRef.current) {
      URL.revokeObjectURL(coverObjectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    coverObjectUrlRef.current = previewUrl;
    setCustomCoverUrl(previewUrl);
    setMenuErrorMessage('');

    try {
      await updateRoomCover(roomId, file);
    } catch (error) {
      setMenuErrorMessage(
        getApiErrorMessage(error, '커버 사진을 저장하지 못했어요.'),
      );
    }
  };

  const exitRoom = async () => {
    if (!roomId || isLeaving) return;

    setIsLeaving(true);
    setMenuErrorMessage('');

    try {
      await leaveRoom(roomId);
      navigate('/home', { replace: true });
    } catch (error) {
      setMenuErrorMessage(
        getApiErrorMessage(error, '공유방에서 나가지 못했어요.'),
      );
    } finally {
      setIsLeaving(false);
    }
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
                <button type="button" disabled={isLeaving} onClick={exitRoom}>
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

      {menuErrorMessage && (
        <p className={styles.feedMessage} role="alert">
          {menuErrorMessage}
        </p>
      )}

      <section className={styles.memberList}>
        {errorMessage && <p className={styles.feedMessage}>{errorMessage}</p>}
        {!errorMessage && isLoading && (
          <p className={styles.feedMessage}>공유방을 불러오는 중이에요.</p>
        )}
        {!errorMessage &&
          !isLoading &&
          members.map((member) => (
            <MemberRecordCard
              key={`${view}-${member.id}`}
              member={member}
              roomId={roomId}
            />
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
          roomId={roomId}
          roomName={roomName}
          onClose={() => setIsInviteOpen(false)}
        />
      )}
    </main>
  );
}
