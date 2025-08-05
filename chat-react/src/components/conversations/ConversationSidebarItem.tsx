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
  console.log("name", conversation.lastMessageSent.author.firstName);
  const MESSAGE_LENGTH_MAX = 50;
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const recipient = getRecipientFromConversation(conversation, user);
  const lastMessageContent = () => {
    const { lastMessageSent } = conversation;
    if (lastMessageSent && lastMessageSent.content)
      return lastMessageSent.content?.length >= MESSAGE_LENGTH_MAX
        ? lastMessageSent.content?.slice(0, MESSAGE_LENGTH_MAX).concat("...")
        : lastMessageSent.content;
    return null;
  };

  return (
    <>
      <ConversationSidebarItemStyle
        onClick={() => navigate(`/conversations/${conversation.id}`)}
        selected={parseInt(id!) === conversation.id}
      >
        <UserAvatar user={user!} />
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
            {user?.id === conversation.lastMessageSent.author.id && (
              <span>Bạn:</span>
            )}{" "}
            {lastMessageContent()}
          </span>
        </ConversationSidebarItemDetails>
      </ConversationSidebarItemStyle>
    </>
  );
};
