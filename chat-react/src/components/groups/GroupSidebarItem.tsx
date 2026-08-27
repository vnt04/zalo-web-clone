import { FC } from "react";
import { LuUsers } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { getLastMessageSentTime } from "../../utils/helpers";
import { ContextMenuEvent, Group } from "../../utils/types";
import {
  ConversationSidebarItemDetails,
  ConversationSidebarItemStyle,
} from "../common/Conversation";
import conversationStyles from "../conversations/index.module.scss";
import styles from "./index.module.scss";

type Props = {
  group: Group;
  onContextMenu: (event: ContextMenuEvent, group: Group) => void;
};

export const GroupSidebarItem: FC<Props> = ({ group, onContextMenu }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const title =
    group.title || group.users.map((user) => user.firstName).join(", ");

  const lastMessagePreview = () => {
    if (group.lastMessageSent?.content) return group.lastMessageSent.content;
    if (group.lastMessageSent?.attachments?.length) return "[Hình ảnh]";
    return null;
  };

  return (
    <ConversationSidebarItemStyle
      className={conversationStyles.itemRow}
      onClick={() => navigate(`/groups/${group.id}`)}
      onContextMenu={(e) => onContextMenu(e, group)}
      selected={parseInt(id!) === group.id}
    >
      {group.avatar ? (
        <img
          className={styles.groupAvatar}
          src={group.avatar}
          alt=""
        />
      ) : (
        <div className={styles.defaultGroupAvatar}>
          <LuUsers size={24} />
        </div>
      )}
      <ConversationSidebarItemDetails>
        <div className={conversationStyles.conversationHeader}>
          <span className={conversationStyles.conversationName}>{title}</span>
          <span className={conversationStyles.conversationLastMessageTime}>
            {getLastMessageSentTime(group.lastMessageSentAt)}
          </span>
        </div>
        <div className={conversationStyles.conversationPreviewRow}>
          <span className={conversationStyles.conversationLastMessage}>
            {lastMessagePreview()}
          </span>
        </div>
      </ConversationSidebarItemDetails>
    </ConversationSidebarItemStyle>
  );
};
