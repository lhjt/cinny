import produce from 'immer';
import { atom, useSetAtom } from 'jotai';
import { MatrixClient, User, UserEvent, UserEventHandlerMap } from 'matrix-js-sdk';
import { useEffect } from 'react';
import { Presence, UserPresence } from '../types/presence';

export type UserPresenceMap = Map<string, UserPresence>;

type UserPresenceResetAction = {
  type: 'RESET';
  presences: UserPresenceMap;
};
type UserPresenceSetAction = {
  type: 'SET';
  userId: string;
  presence: UserPresence;
};
export type UserPresenceAction = UserPresenceResetAction | UserPresenceSetAction;

const baseUserPresenceAtom = atom<UserPresenceMap>(new Map());

export const presenceEqual = (a: UserPresence, b: UserPresence): boolean =>
  a.presence === b.presence &&
  a.status === b.status &&
  a.active === b.active &&
  a.lastActiveTs === b.lastActiveTs;

const getUserPresence = (user: User): UserPresence => ({
  presence: user.presence as Presence,
  status: user.presenceStatusMsg,
  active: user.currentlyActive,
  lastActiveTs: user.getLastActiveTs(),
});

export const userPresenceAtom = atom<UserPresenceMap, [UserPresenceAction], undefined>(
  (get) => get(baseUserPresenceAtom),
  (get, set, action) => {
    if (action.type === 'RESET') {
      set(baseUserPresenceAtom, action.presences);
      return;
    }

    if (action.type === 'SET') {
      const existing = get(baseUserPresenceAtom).get(action.userId);
      if (existing && presenceEqual(existing, action.presence)) return;
      set(
        baseUserPresenceAtom,
        produce(get(baseUserPresenceAtom), (draft) => {
          draft.set(action.userId, action.presence);
        })
      );
    }
  }
);

export const useBindUserPresenceAtom = (
  mx: MatrixClient,
  presenceAtom: typeof userPresenceAtom
) => {
  const setPresence = useSetAtom(presenceAtom);

  useEffect(() => {
    const presences: UserPresenceMap = new Map();
    mx.getUsers().forEach((user) => {
      presences.set(user.userId, getUserPresence(user));
    });
    setPresence({ type: 'RESET', presences });
  }, [mx, setPresence]);

  useEffect(() => {
    const handleUserUpdate: UserEventHandlerMap[UserEvent.Presence] = (_event, user) => {
      setPresence({
        type: 'SET',
        userId: user.userId,
        presence: getUserPresence(user),
      });
    };

    mx.on(UserEvent.Presence, handleUserUpdate);
    mx.on(UserEvent.CurrentlyActive, handleUserUpdate);
    mx.on(UserEvent.LastPresenceTs, handleUserUpdate);

    return () => {
      mx.removeListener(UserEvent.Presence, handleUserUpdate);
      mx.removeListener(UserEvent.CurrentlyActive, handleUserUpdate);
      mx.removeListener(UserEvent.LastPresenceTs, handleUserUpdate);
    };
  }, [mx, setPresence]);
};
