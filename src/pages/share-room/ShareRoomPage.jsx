import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  shareRoomAddIcon,
  shareRoomAddWhiteIcon,
  shareRoomBackIcon,
  shareRoomInviteDecoration,
  shareRoomLogoutIcon,
  shareRoomMoreIcon,
  shareRoomPhotoIcon,
} from '@/assets';
import { getApiErrorMessage } from '@/api/error';
import {
  createRoomInvite,
  leaveRoom,
  resolveImageUrl,
  updateRoomCover,
} from '@/api/rooms';
import { getRoomCoverTheme } from '@/utils/roomCoverTheme';
import InviteDialog from './components/InviteDialog';
import MemberRecordCard from './components/MemberRecordCard';
import { useRoomFeed } from './hooks/useRoomFeed';
import styles from './ShareRoomPage.module.scss';

const INVITE_TOAST_DURATION_MS = 2500;

function isInvitePermissionDeniedError(error) {
  return (
    error?.response?.status === 403 &&
    error?.response?.data?.code === 'ROOM_403_1'
  );
}

export default function ShareRoomPage() {
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [invite, setInvite] = useState(null);
  const [inviteRoomId, setInviteRoomId] = useState('');
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [invitePermissionDeniedRoomId, setInvitePermissionDeniedRoomId] =
    useState('');
  const [inviteToast, setInviteToast] = useState(null);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [failedCoverUrl, setFailedCoverUrl] = useState('');
  const [menuErrorMessage, setMenuErrorMessage] = useState('');
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const fileInputRef = useRef(null);
  const moreButtonRef = useRef(null);
  const coverObjectUrlRef = useRef('');
  const inviteRequestControllerRef = useRef(null);
  const inviteToastTimerRef = useRef(null);
  const inviteToastSequenceRef = useRef(0);
  const activeRoomIdRef = useRef(roomId);

  const { members, roomInfo, isLoading, errorMessage } = useRoomFeed(roomId);
  const isInvitePermissionDenied = invitePermissionDeniedRoomId === roomId;
  const roomName = roomInfo?.roomName || location.state?.roomName || '공유방';
  // 나 혼자면 초대 유도 화면, 기록이 하나라도 있으면 기록 화면
  const isInitial = !errorMessage && !isLoading && members.length <= 1;
  const hasRecords = members.some((member) => member.records.length > 0);
  const view = hasRecords ? 'records' : 'empty';
  const coverImageUrl =
    customCoverUrl ||
    resolveImageUrl(roomInfo?.coverImageUrl || location.state?.coverImageUrl);
  const hasCoverImage =
    Boolean(coverImageUrl) && failedCoverUrl !== coverImageUrl;

  useEffect(
    () => () => {
      const inviteController = inviteRequestControllerRef.current;
      inviteRequestControllerRef.current = null;
      inviteController?.abort();
      window.clearTimeout(inviteToastTimerRef.current);

      if (coverObjectUrlRef.current) {
        URL.revokeObjectURL(coverObjectUrlRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    activeRoomIdRef.current = roomId;
    inviteRequestControllerRef.current?.abort();
  }, [roomId]);

  const showInviteToast = (message) => {
    window.clearTimeout(inviteToastTimerRef.current);
    inviteToastSequenceRef.current += 1;
    setInviteToast({ id: inviteToastSequenceRef.current, roomId, message });

    inviteToastTimerRef.current = window.setTimeout(() => {
      inviteToastTimerRef.current = null;
      setInviteToast(null);
    }, INVITE_TOAST_DURATION_MS);
  };

  const openInviteDialog = async () => {
    if (
      !roomId ||
      isInviteLoading ||
      inviteRequestControllerRef.current
    ) {
      return;
    }

    if (isInvitePermissionDenied) {
      setIsMenuOpen(false);
      showInviteToast('방장만 친구를 초대할 수 있어요.');
      moreButtonRef.current?.focus();
      return;
    }

    const controller = new AbortController();
    inviteRequestControllerRef.current = controller;
    setIsInviteLoading(true);
    setMenuErrorMessage('');

    try {
      const nextInvite = await createRoomInvite(roomId, {
        signal: controller.signal,
      });

      if (controller.signal.aborted || activeRoomIdRef.current !== roomId) {
        return;
      }

      if (!nextInvite?.code) throw new Error('INVITE_CODE_MISSING');

      setInvite(nextInvite);
      setInviteRoomId(roomId);
      setIsMenuOpen(false);
      setIsInviteOpen(true);
    } catch (error) {
      if (controller.signal.aborted || activeRoomIdRef.current !== roomId) {
        return;
      }

      setIsMenuOpen(false);

      if (isInvitePermissionDeniedError(error)) {
        setInvitePermissionDeniedRoomId(roomId);
        showInviteToast('방장만 친구를 초대할 수 있어요.');
        moreButtonRef.current?.focus();
      } else {
        setMenuErrorMessage(
          getApiErrorMessage(error, '초대 링크를 만들지 못했어요.'),
        );
      }
    } finally {
      if (inviteRequestControllerRef.current === controller) {
        inviteRequestControllerRef.current = null;
        setIsInviteLoading(false);
      }
    }
  };

  const closeInviteDialog = () => {
    setIsInviteOpen(false);
    setInvite(null);
    setInviteRoomId('');
  };

  const openCoverPicker = () => {
    if (isCoverUploading) return;

    setIsMenuOpen(false);
    fileInputRef.current?.click();
  };

  const changeCoverImage = async (event) => {
    const [file] = event.target.files;
    const previousCoverUrl = customCoverUrl;

    event.target.value = '';

    if (!file || !roomId || isCoverUploading) return;

    setIsCoverUploading(true);

    // 업로드가 끝나기 전에도 고른 사진을 먼저 보여줌
    if (coverObjectUrlRef.current) {
      URL.revokeObjectURL(coverObjectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    coverObjectUrlRef.current = previewUrl;
    setCustomCoverUrl(previewUrl);
    setFailedCoverUrl('');
    setMenuErrorMessage('');

    try {
      const result = await updateRoomCover(roomId, file);
      const savedCoverUrl = resolveImageUrl(result?.coverImageUrl);

      if (!savedCoverUrl) throw new Error('COVER_URL_MISSING');

      setCustomCoverUrl(savedCoverUrl);
      URL.revokeObjectURL(previewUrl);
      coverObjectUrlRef.current = '';
    } catch (error) {
      URL.revokeObjectURL(previewUrl);
      coverObjectUrlRef.current = '';
      setCustomCoverUrl(previousCoverUrl);
      setMenuErrorMessage(
        getApiErrorMessage(error, '커버 사진을 저장하지 못했어요.'),
      );
    } finally {
      setIsCoverUploading(false);
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
        data-cover-theme={getRoomCoverTheme(roomId)}
      >
        {hasCoverImage && (
          <img
            className={styles.coverImage}
            src={coverImageUrl}
            alt=""
            onError={() => setFailedCoverUrl(coverImageUrl)}
          />
        )}
        {hasCoverImage && <div className={styles.coverGradient} />}

        <button
          type="button"
          className={styles.backButton}
          title="홈으로 가기"
          onClick={() => navigate('/home')}
        >
          <img src={shareRoomBackIcon} alt="" />
        </button>

        <button
          ref={moreButtonRef}
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
                <button
                  type="button"
                  disabled={isInviteLoading}
                  onClick={openInviteDialog}
                >
                  {isInviteLoading ? '초대 권한 확인 중...' : '친구 초대하기'}
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
                <button
                  type="button"
                  disabled={isCoverUploading}
                  onClick={openCoverPicker}
                >
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
              key={member.id}
              member={member}
              roomId={roomId}
            />
          ))}
      </section>

      {isInitial && !isInvitePermissionDenied && (
        <section className={styles.inviteContent}>
          <img src={shareRoomInviteDecoration} alt="" />
          <div className={styles.inviteMessage}>
            <strong>친구를 초대해 보세요.</strong>
            <span>많은 친구들과 기록을 공유해 봐요!</span>
          </div>
          <button
            type="button"
            disabled={isInviteLoading}
            onClick={openInviteDialog}
          >
            <span className={styles.inviteButtonIcon}>
              <img src={shareRoomAddWhiteIcon} alt="" />
            </span>
            {isInviteLoading ? '초대 권한 확인 중...' : '초대 링크 공유하기'}
          </button>
        </section>
      )}

      <input
        ref={fileInputRef}
        className={styles.coverInput}
        type="file"
        accept="image/*"
        disabled={isCoverUploading}
        onChange={changeCoverImage}
      />

      {isInviteOpen && invite && inviteRoomId === roomId && (
        <InviteDialog
          invite={invite}
          roomName={roomName}
          onClose={closeInviteDialog}
        />
      )}

      {inviteToast?.roomId === roomId && (
        <p
          key={inviteToast.id}
          className={styles.inviteToast}
          role="alert"
          aria-atomic="true"
        >
          {inviteToast.message}
        </p>
      )}
    </main>
  );
}
