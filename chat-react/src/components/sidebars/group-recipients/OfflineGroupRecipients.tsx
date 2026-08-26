import { FC } from "react";
import { Crown } from "akar-icons";
import { formatPhoneNumber } from "../../../utils/helpers";
import { ContextMenuEvent, Group, User } from "../../../utils/types";
import { UserRow } from "../../common/UserRow";
import styles from "../../groups/index.module.scss";

type Props = {
  onlineUsers: User[];
  group?: Group;
  onUserContextMenu: (e: ContextMenuEvent, user: User) => void;
};

export const OfflineGroupRecipients: FC<Props> = ({
  onlineUsers,
  group,
  onUserContextMenu,
}) => (
  <>
    {group?.users
      .filter((user) => !onlineUsers.some((online) => online.id === user.id))
      .map((user) => (
        <UserRow
          key={user.id}
          avatarUrl={user.profile?.avatar}
          name={`${user.firstName} ${user.lastName}`}
          subtitle={formatPhoneNumber(user.phoneNumber)}
          action={
            user.id === group?.owner.id ? (
              <span className={styles.ownerBadge} title="Trưởng nhóm">
                <Crown size={18} />
              </span>
            ) : undefined
          }
          onContextMenu={(e) => onUserContextMenu(e, user)}
        />
      ))}
  </>
);
