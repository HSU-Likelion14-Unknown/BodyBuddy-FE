import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { homeShareRoomMascot } from '@/assets';
import { getApiErrorMessage } from '@/api/error';
import {
  createRoom,
  getMyRooms,
  getRoomMembers,
  resolveImageUrl,
} from '@/api/rooms';
import { getRoomCoverTheme } from '@/utils/roomCoverTheme';
import styles from './ShareRoomSection.module.scss';

const MEMBER_PREVIEW_LIMIT = 3;

function RoomCover({ src }) {
  const coverUrl = resolveImageUrl(src);
  const [failedUrl, setFailedUrl] = useState('');

  if (!coverUrl || failedUrl === coverUrl) return null;

  return (
    <>
      <img
        className={styles.roomCover}
        src={coverUrl}
        alt=""
        onError={() => setFailedUrl(coverUrl)}
      />
      <span className={styles.roomGradient} />
    </>
  );
}

function MemberProfile({ member }) {
  const profileUrl = resolveImageUrl(member.profileImageUrl);
  const [failedUrl, setFailedUrl] = useState('');
  const nickname =
    typeof member.nickname === 'string' ? member.nickname.trim() : '';
  const initial = Array.from(nickname)[0] ?? '?';

  if (!profileUrl || failedUrl === profileUrl) {
    return <span className={styles.memberProfile}>{initial}</span>;
  }

  return (
    <img
      className={styles.memberProfile}
      src={profileUrl}
      alt=""
      onError={() => setFailedUrl(profileUrl)}
    />
  );
}

function RoomMemberProfiles({ members = [] }) {
  if (members.length === 0) return null;

  const visibleMembers = members.slice(0, MEMBER_PREVIEW_LIMIT);
  const remainingCount = members.length - visibleMembers.length;

  return (
    <span className={styles.memberProfiles} aria-hidden="true">
      {visibleMembers.map((member, index) => (
        <MemberProfile
          key={member.userId ?? `${member.nickname ?? 'member'}-${index}`}
          member={member}
        />
      ))}
      {remainingCount > 0 && (
        <span
          className={`${styles.memberProfile} ${styles.memberOverflow}`}
        >
          +{remainingCount}
        </span>
      )}
    </span>
  );
}

export default function ShareRoomSection({ nickname }) {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const trimmedRoomName = roomName.trim();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadRooms = async () => {
      try {
        const data = await getMyRooms({ signal: controller.signal });
        const nextRooms = data.rooms ?? [];

        if (controller.signal.aborted) return;

        setRooms(nextRooms);
        setIsLoading(false);

        const memberResults = await Promise.allSettled(
          nextRooms.map((room) =>
            getRoomMembers(room.roomId, { signal: controller.signal }),
          ),
        );

        if (controller.signal.aborted) return;

        const membersByRoomId = new Map();

        memberResults.forEach((result, index) => {
          if (result.status !== 'fulfilled') return;

          membersByRoomId.set(
            String(nextRooms[index].roomId),
            result.value.members ?? [],
          );
        });

        setRooms((currentRooms) =>
          currentRooms.map((room) => {
            const roomKey = String(room.roomId);

            return membersByRoomId.has(roomKey)
              ? { ...room, members: membersByRoomId.get(roomKey) }
              : room;
          }),
        );
      } catch (error) {
        if (controller.signal.aborted) return;

        setErrorMessage(
          getApiErrorMessage(error, '공유방 목록을 불러오지 못했어요.'),
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadRooms();

    return () => controller.abort();
  }, []);

  const openRoom = (room) => {
    navigate(`/share-room/${room.roomId}`, {
      state: {
        roomName: room.roomName,
        coverImageUrl: resolveImageUrl(room.coverImageUrl),
      },
    });
  };

  const closeCreateDialog = () => {
    setIsCreateOpen(false);
    setRoomName('');
  };

  const submitCreateRoom = async (event) => {
    event.preventDefault();

    if (!trimmedRoomName || isCreating) return;

    setIsCreating(true);
    setErrorMessage('');

    try {
      const room = await createRoom({ roomName: trimmedRoomName });

      navigate(`/share-room/${room.roomId}`, {
        state: { roomName: room.roomName },
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '공유방을 만들지 못했어요.'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <section className={styles.roomSection}>
        <img className={styles.mascot} src={homeShareRoomMascot} alt="" />
        <h2>{nickname}님의 친구 공유 방</h2>

        {isLoading && <p className={styles.stateMessage}>불러오는 중이에요.</p>}

        {!isLoading && errorMessage && (
          <p className={styles.stateMessage}>{errorMessage}</p>
        )}

        {!isLoading && !errorMessage && rooms.length > 0 && (
          <div
            className={styles.roomList}
            data-compact={rooms.length >= 3}
          >
            {rooms.map((room) => (
              <button
                key={room.roomId}
                type="button"
                className={styles.roomCard}
                data-cover-theme={getRoomCoverTheme(room.roomId)}
                title={`${room.roomName} 공유방 들어가기`}
                onClick={() => openRoom(room)}
              >
                <RoomCover src={room.coverImageUrl} />
                <RoomMemberProfiles members={room.members} />
                <span className={styles.roomName}>{room.roomName}</span>
              </button>
            ))}

            <button
              type="button"
              className={styles.createRoomCard}
              title="새 친구방 만들기"
              onClick={() => setIsCreateOpen(true)}
            >
              <span className={styles.createRoomIcon} aria-hidden="true">
                <FiPlus />
              </span>
              <span className={styles.createRoomLabel}>
                새 친구방
                <br />
                만들기
              </span>
            </button>
          </div>
        )}

        {!isLoading && !errorMessage && rooms.length === 0 && (
          <div className={styles.emptyContent}>
            <strong>아직 공유하는 방이 없어요.</strong>
            <span>친구들과 함께 나의 영양소를 공개해봐요!</span>
          </div>
        )}

        {(isLoading || errorMessage || rooms.length === 0) && (
          <button
            type="button"
            className={styles.openCreateButton}
            onClick={() => setIsCreateOpen(true)}
          >
            새 친구방 만들기
            <FiPlus />
          </button>
        )}
      </section>

      {isCreateOpen &&
        createPortal(
          <div className={styles.overlay} onMouseDown={closeCreateDialog}>
            <section
              className={styles.dialog}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <h2>방 이름을 정해주세요.</h2>
              <p>1 ~ 10자 사이로 입력해 주세요.</p>

              <form onSubmit={submitCreateRoom}>
                <label htmlFor="share-room-name">방 이름</label>
                <input
                  id="share-room-name"
                  type="text"
                  value={roomName}
                  maxLength={10}
                  autoFocus
                  onChange={(event) => setRoomName(event.target.value)}
                />
                <button type="submit" disabled={!trimmedRoomName || isCreating}>
                  {isCreating ? '만드는 중...' : '만들기'}
                </button>
              </form>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
