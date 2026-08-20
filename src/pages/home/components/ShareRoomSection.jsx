import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { homeShareRoomMascot, shareRoomCover } from '@/assets';
import { getApiErrorMessage } from '@/api/error';
import { createRoom, getMyRooms } from '@/api/rooms';
import styles from './ShareRoomSection.module.scss';

export default function ShareRoomSection() {
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

    getMyRooms({ signal: controller.signal })
      .then((data) => setRooms(data.rooms ?? []))
      .catch((error) => {
        if (controller.signal.aborted) return;

        setErrorMessage(
          getApiErrorMessage(error, '공유방 목록을 불러오지 못했어요.'),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const openRoom = (room) => {
    navigate(`/share-room/${room.roomId}`, {
      state: { roomName: room.roomName },
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
        <h2>00님의 친구 공유 방</h2>

        {isLoading && <p className={styles.stateMessage}>불러오는 중이에요.</p>}

        {!isLoading && errorMessage && (
          <p className={styles.stateMessage}>{errorMessage}</p>
        )}

        {!isLoading && !errorMessage && rooms.length > 0 && (
          <div className={styles.roomList}>
            {rooms.map((room) => (
              <button
                key={room.roomId}
                type="button"
                className={styles.roomCard}
                title={`${room.roomName} 공유방 들어가기`}
                onClick={() => openRoom(room)}
              >
                <img className={styles.roomCover} src={shareRoomCover} alt="" />
                <span className={styles.roomGradient} />
                <span className={styles.roomName}>{room.roomName}</span>
              </button>
            ))}
          </div>
        )}

        {!isLoading && !errorMessage && rooms.length === 0 && (
          <div className={styles.emptyContent}>
            <strong>아직 공유하는 방이 없어요.</strong>
            <span>친구들과 함께 나의 영양소를 공개해봐요!</span>
          </div>
        )}

        <button
          type="button"
          className={styles.openCreateButton}
          onClick={() => setIsCreateOpen(true)}
        >
          새 친구방 만들기
          <FiPlus />
        </button>
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
