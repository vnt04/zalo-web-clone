import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../utils/context/AuthContext";
import {
  getLastMessageSentTime,
  getRecipientFromConversation,
} from "../../utils/helpers";
import { Conversation } from "../../utils/types";

import styles from "./index.module.scss";
import {
  ConversationSidebarItemDetails,
  ConversationSidebarItemStyle,
} from "../common/Conversation";
import { UserAvatar } from "../users/UserAvatar";

type Props = {
  conversation: Conversation;
};

export const ConversationSidebarItem: React.FC<Props> = ({ conversation }) => {
  // check if this is a new conversation with no message before.
  if (!conversation.lastMessageSent) return null;

  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const recipient = getRecipientFromConversation(conversation, user);

  // Cắt chuỗi để lo phần tràn dòng, CSS ellipsis co theo bề rộng cột.
  const lastMessagePreview = () => {
    const { lastMessageSent } = conversation;
    if (lastMessageSent?.content) return lastMessageSent.content;
    if (lastMessageSent?.attachments?.length) return "[Hình ảnh]";
    return null;
  };

  return (
    <ConversationSidebarItemStyle
      onClick={() => navigate(`/conversations/${conversation.id}`)}
      selected={parseInt(id!) === conversation.id}
    >
      <UserAvatar user={conversation.recipient} />
      <ConversationSidebarItemDetails>
        <div className={styles.conversationHeader}>
          <span className={styles.conversationName}>
            {`${recipient?.lastName} ${recipient?.firstName}`}
          </span>
          <span className={styles.conversationLastMessageTime}>
            {getLastMessageSentTime(conversation.lastMessageSentAt)}
          </span>
        </div>

        <span className={styles.conversationLastMessage}>
          {user?.id === conversation.lastMessageSent.author?.id && "Bạn: "}
          {lastMessagePreview()}
        </span>
      </ConversationSidebarItemDetails>
    </ConversationSidebarItemStyle>
  );
};
