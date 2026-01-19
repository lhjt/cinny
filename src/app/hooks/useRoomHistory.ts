import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { useSelectedRoom } from './router/useSelectedRoom';
import { updateRoomHistoryAtom } from '../state/room/roomHistory';

export const useBindRoomHistory = () => {
  const selectedRoomId = useSelectedRoom();
  const setRoomHistory = useSetAtom(updateRoomHistoryAtom);

  useEffect(() => {
    if (selectedRoomId) {
      setRoomHistory(selectedRoomId);
    }
  }, [selectedRoomId, setRoomHistory]);
};
