import {
  shareRoomBibimbap,
  shareRoomCucumberGimbap,
  shareRoomFriendAvatar,
  shareRoomMalatang,
  shareRoomOwnerAvatar,
} from '@/assets';

const createRecords = (count, record) =>
  Array.from({ length: count }, (_, index) => ({
    ...record,
    id: `${record.id}-${index + 1}`,
    label: `기록 ${index + 1}`,
  }));

export const INITIAL_MEMBERS = [
  {
    id: 'member-me',
    nickname: '얄라리셩',
    avatar: shareRoomOwnerAvatar,
    isMe: true,
    records: [],
  },
];

export const EMPTY_MEMBERS = [
  ...INITIAL_MEMBERS,
  {
    id: 'member-friend-1',
    nickname: '곽덕배',
    avatar: shareRoomFriendAvatar,
    records: [],
  },
  {
    id: 'member-friend-2',
    nickname: '김갑수에여',
    avatar: shareRoomOwnerAvatar,
    records: [],
  },
];

export const RECORDED_MEMBERS = [
  {
    ...INITIAL_MEMBERS[0],
    records: createRecords(3, {
      id: 'malatang',
      image: shareRoomMalatang,
      crop: 'malatangCrop',
      recommendation: '추천 - 구운 연어',
      foods: ['마라탕'],
      reactions: [
        { id: 'fire', emoji: '🔥', label: '최고예요', count: 1 },
        { id: 'heart', emoji: '❤️', label: '좋아요', count: 1 },
        { id: 'yum', emoji: '🤤', label: '맛있겠어요', count: 2 },
      ],
    }),
  },
  {
    id: 'member-friend-1',
    nickname: '곽덕배',
    avatar: shareRoomFriendAvatar,
    initialRecordIndex: 1,
    records: createRecords(3, {
      id: 'bibimbap',
      image: shareRoomBibimbap,
      crop: 'bibimbapCrop',
      recommendation: '추천 음식 없음',
      foods: ['비빔밥', '고추 짱아찌', '깍두기'],
      reactions: [],
    }),
  },
  {
    id: 'member-friend-2',
    nickname: '김갑수에여',
    avatar: shareRoomOwnerAvatar,
    records: createRecords(4, {
      id: 'cucumber-gimbap',
      image: shareRoomCucumberGimbap,
      recommendation: '추천 - 닭가슴살',
      foods: ['오이김밥'],
      reactions: [
        { id: 'dislike', emoji: '🤮', label: '아쉬워요', count: 2 },
        { id: 'angry', emoji: '😡', label: '화나요', count: 1 },
        { id: 'yum', emoji: '🤤', label: '맛있겠어요', count: 1 },
        { id: 'tired', emoji: '😩', label: '힘들겠어요', count: 1 },
      ],
    }),
  },
];
