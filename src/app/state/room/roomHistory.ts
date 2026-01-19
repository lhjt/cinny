import { atom } from 'jotai';

export type RoomHistory = {
  current?: string;
  history: string[];
};

const MAX_ROOM_HISTORY = 10;

const baseRoomHistoryAtom = atom<RoomHistory>({ current: undefined, history: [] });

export const roomHistoryAtom = atom((get) => get(baseRoomHistoryAtom));

export const updateRoomHistoryAtom = atom(null, (get, set, nextRoomId: string) => {
  const { current, history } = get(baseRoomHistoryAtom);
  if (nextRoomId === current) return;

  let nextHistory = history.filter((roomId) => roomId !== nextRoomId);
  if (current) {
    nextHistory = [current, ...nextHistory];
  }

  set(baseRoomHistoryAtom, {
    current: nextRoomId,
    history: nextHistory.slice(0, MAX_ROOM_HISTORY),
  });
});
