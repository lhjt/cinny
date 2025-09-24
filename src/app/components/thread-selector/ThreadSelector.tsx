import { Avatar, Box, Icon, Icons, Text } from 'folds';
import React, { ReactNode } from 'react';
import classNames from 'classnames';
import { IThreadBundledRelationship, Room } from 'matrix-js-sdk';
import { ContainerColor } from '../../styles/ContainerColor.css';
import * as css from './styles.css';
import { UserAvatar } from '../user-avatar';
import { getMemberAvatarMxc, getMemberDisplayName } from '../../utils/room';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { useMediaAuthentication } from '../../hooks/useMediaAuthentication';
import { getMxIdLocalPart, mxcUrlToHttp } from '../../utils/matrix';

export function ThreadSelectorContainer({ children }: { children: ReactNode }) {
  return <Box className={css.ThreadSelectorContainer}>{children}</Box>;
}

type ThreadSelectorProps = {
  room: Room;
  senderId: string;
  threadDetail: IThreadBundledRelationship;
  outlined?: boolean;
};

export function ThreadSelector({ room, senderId, threadDetail, outlined }: ThreadSelectorProps) {
  const mx = useMatrixClient();
  const useAuthentication = useMediaAuthentication();
  const senderAvatarMxc = getMemberAvatarMxc(room, senderId);

  const latestEvent = threadDetail.latest_event;
  const latestSenderId = latestEvent.sender;
  const latestSenderAvatarMxc = getMemberAvatarMxc(room, latestSenderId);
  const latestDisplayName =
    getMemberDisplayName(room, latestSenderId) ??
    getMxIdLocalPart(latestSenderId) ??
    latestSenderId;

  const latestEventTs = latestEvent.origin_server_ts;

  return (
    <Box
      className={classNames(
        css.ThreadSelector,
        outlined && css.ThreadSectorOutlined,
        ContainerColor({ variant: 'SurfaceVariant' })
      )}
      alignItems="Center"
      gap="200"
    >
      <Box gap="100" alignItems="Inherit">
        <Avatar size="200" radii="300">
          <UserAvatar
            userId={senderId}
            src={
              senderAvatarMxc
                ? mxcUrlToHttp(mx, senderAvatarMxc, useAuthentication, 48, 48, 'crop') ?? undefined
                : undefined
            }
            alt={senderId}
            renderFallback={() => <Icon size="200" src={Icons.User} filled />}
          />
        </Avatar>
        {latestSenderId && (
          <Avatar size="200" radii="300">
            <UserAvatar
              userId={latestSenderId}
              src={
                latestSenderAvatarMxc
                  ? mxcUrlToHttp(mx, latestSenderAvatarMxc, useAuthentication, 48, 48, 'crop') ??
                    undefined
                  : undefined
              }
              alt={senderId}
              renderFallback={() => <Icon size="200" src={Icons.User} filled />}
            />
          </Avatar>
        )}
      </Box>
      <Box gap="200" alignItems="Inherit">
        <Text className={css.ThreadRepliesCount} size="L400">
          {threadDetail.count} {threadDetail.count === 1 ? 'Reply' : 'Replies'}
        </Text>
        <Text size="T200" truncate>
          {/* TODO: date */}
          Last Reply by <b>{latestDisplayName}</b> at {new Date(latestEventTs).getTime()}
        </Text>
        <Icon size="100" src={Icons.ChevronRight} />
      </Box>
    </Box>
  );
}
