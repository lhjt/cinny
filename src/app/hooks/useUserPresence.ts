import { useCallback, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { presenceEqual, userPresenceAtom, UserPresenceMap } from '../state/presence';
import { Presence, UserPresence } from '../types/presence';

const comparePresenceEqual = (a?: UserPresence, b?: UserPresence): boolean => {
  if (!a || !b) return a === b;
  return presenceEqual(a, b);
};

export const useUserPresence = (userId: string): UserPresence | undefined => {
  const selector = useCallback(
    (presences: UserPresenceMap) => presences.get(userId),
    [userId]
  );
  return useAtomValue(selectAtom(userPresenceAtom, selector, comparePresenceEqual));
};

export const useRenderablePresence = (userId: string): UserPresence | undefined => {
  const presence = useUserPresence(userId);
  return presence && presence.lastActiveTs !== 0 ? presence : undefined;
};

export const usePresenceLabel = (): Record<Presence, string> =>
  useMemo(
    () => ({
      [Presence.Online]: 'Active',
      [Presence.Unavailable]: 'Busy',
      [Presence.Offline]: 'Away',
    }),
    []
  );
