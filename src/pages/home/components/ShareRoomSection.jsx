import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import {
  homeShareRoomMascot,
  shareRoomBibimbap,
  shareRoomCover,
  shareRoomCucumberGimbap,
  shareRoomMalatang,
} from '@/assets';
import styles from './ShareRoomSection.module.scss';

const MOCK_USERS = {
  owner: { id: 'owner', profileColor: '#f5a9a9' },
  friend1: { id: 'friend-1', profileColor: '#ffd67a' },
  friend2: { id: 'friend-2', profileColor: '#9fd8c5' },
  friend3: { id: 'friend-3', profileColor: '#aaa7e8' },
  friend4: { id: 'friend-4', profileColor: '#efb7d2' },
};

const MOCK_ROOMS = [
  {
    id: 'likelion',
    name: '멋사들 ~',
    cover: shareRoomMalatang,
    members: [
      MOCK_USERS.owner,
      MOCK_USERS.friend1,
      MOCK_USERS.friend2,
      MOCK_USERS.friend3,
    ],
  },
  {
    id: 'unknown',
    name: '알수없음조',
    cover: shareRoomCover,
    members: [
      MOCK_USERS.owner,
      MOCK_USERS.friend1,
      MOCK_USERS.friend2,
      MOCK_USERS.friend3,
      MOCK_USERS.friend4,
    ],
  },
  {
    id: 'central',
    name: '중앙팟',
    cover: shareRoomBibimbap,
    members: [MOCK_USERS.owner, MOCK_USERS.friend2, MOCK_USERS.friend4],
  },
  {
    id: 'hansung',
    name: '한성둥둥이가...',
    cover: shareRoomCucumberGimbap,
    members: [MOCK_USERS.owner, MOCK_USERS.friend3],
  },
];

export default function ShareRoomSection() {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const trimmedRoomName = roomName.trim();

  const openRoom = (room) => {
    navigate(`/share-room/${room.id}`, {
      state: {
        roomName: room.name,
        view: 'records',
      },
    });
  };

  const closeCreateDialog = () => {
    setIsCreateOpen(false);
    setRoomName('');
  };

  const createRoom = (event) => {
    event.preventDefault();

    if (!trimmedRoomName) return;

    navigate('/share-room/preview', {
      state: {
        roomName: trimmedRoomName,
        view: 'initial',
      },
    });
  };

  return (
    <>
      <section className={styles.roomSection}>
        <img className={styles.mascot} src={homeShareRoomMascot} alt="" />
        <h2>00님의 친구 공유 방</h2>

        {MOCK_ROOMS.length > 0 ? (
          <div className={styles.roomList}>
            {MOCK_ROOMS.map((room) => (
              <button
                key={room.id}
                type="button"
                className={styles.roomCard}
                title={`${room.name} 공유방 들어가기`}
                onClick={() => openRoom(room)}
              >
                <img className={styles.roomCover} src={room.cover} alt="" />
                <span className={styles.roomGradient} />

                <span className={styles.memberProfiles}>
                  {room.members.map((member) => (
                    <span
                      key={member.id}
                      className={styles.memberProfile}
                      style={{ backgroundColor: member.profileColor }}
                    />
                  ))}
                </span>

                <span className={styles.roomName}>{room.name}</span>
              </button>
            ))}
          </div>
        ) : (
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

      {isCreateOpen && (
        <div className={styles.overlay} onMouseDown={closeCreateDialog}>
          <section
            className={styles.dialog}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2>방 이름을 정해주세요.</h2>
            <p>1 ~ 10자 사이로 입력해 주세요.</p>

            <form onSubmit={createRoom}>
              <label htmlFor="share-room-name">방 이름</label>
              <input
                id="share-room-name"
                type="text"
                value={roomName}
                maxLength={10}
                autoFocus
                onChange={(event) => setRoomName(event.target.value)}
              />
              <button type="submit" disabled={!trimmedRoomName}>
                만들기
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
