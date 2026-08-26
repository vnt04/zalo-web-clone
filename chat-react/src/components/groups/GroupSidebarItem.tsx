import { FC } from "react";
import { PeopleGroup } from "akar-icons";
import { useNavigate, useParams } from "react-router-dom";
import { CDN_URL } from "../../utils/constants";
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
          src={CDN_URL.BASE.concat(group.avatar)}
          alt=""
        />
      ) : (
        <div className={styles.defaultGroupAvatar}>
          <PeopleGroup size={24} />
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
