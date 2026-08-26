import { FC } from "react";
import { Crown } from "akar-icons";
import { ContextMenuEvent, Group, User } from "../../../utils/types";
import { UserRow } from "../../common/UserRow";
import styles from "../../groups/index.module.scss";

type Props = {
  users: User[];
  group?: Group;
  onUserContextMenu: (e: ContextMenuEvent, user: User) => void;
};

export const OnlineGroupRecipients: FC<Props> = ({
  users,
  group,
  onUserContextMenu,
}) => (
  <>
    {users.map((user) => (
      <UserRow
        key={user.id}
        avatarUrl={user.profile?.avatar}
        name={`${user.firstName} ${user.lastName}`}
        subtitle={user.presence?.statusMessage || "Đang hoạt động"}
        isOnline
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
