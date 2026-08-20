const ROOM_COVER_THEME_COUNT = 4;

export function getRoomCoverTheme(seed) {
  let hash = 0;

  for (const character of String(seed ?? '')) {
    hash = (hash * 31 + character.codePointAt(0)) >>> 0;
  }

  return hash % ROOM_COVER_THEME_COUNT;
}
