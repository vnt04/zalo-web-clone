import { useContext } from "react";
import { BsBellSlashFill, BsPin, BsPinAngleFill } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { AppDispatch } from "../../store";
import { updateConversationStateThunk } from "../../store/conversationSlice";
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
import classNames from "classnames";

type Props = {
  conversation: Conversation;
};

const UNREAD_BADGE_MAX = 99;

export const ConversationSidebarItem: React.FC<Props> = ({ conversation }) => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const recipient = getRecipientFromConversation(conversation, user);

  const unreadCount = conversation.unreadCount ?? 0;
  const hasUnread = unreadCount > 0;

  // Guard phải nằm dưới mọi hook: lastMessageSent chuyển null -> có giá trị sẽ
  // đổi số hook giữa hai lần render và làm sập cây React.
  if (!conversation.lastMessageSent) return null;

  // Cắt chuỗi để lo phần tràn dòng, CSS ellipsis co theo bề rộng cột.
  const lastMessagePreview = () => {
    const { lastMessageSent } = conversation;
    if (lastMessageSent?.content) return lastMessageSent.content;
    if (lastMessageSent?.attachments?.length) return "[Hình ảnh]";
    return null;
  };

  const togglePinned = (event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(
      updateConversationStateThunk({
        id: conversation.id,
        isPinned: !conversation.isPinned,
      })
    );
  };

  return (
    <ConversationSidebarItemStyle
      className={styles.itemRow}
      onClick={() => navigate(`/conversations/${conversation.id}`)}
      selected={parseInt(id!) === conversation.id}
    >
      <UserAvatar user={conversation.recipient} />
      <ConversationSidebarItemDetails>
        <div className={styles.conversationHeader}>
          <span
            className={classNames(
              styles.conversationName,
              hasUnread && styles.conversationNameUnread
            )}
          >
            {`${recipient?.lastName} ${recipient?.firstName}`}
          </span>
          {conversation.isMuted && (
            <BsBellSlashFill className={styles.conversationMuted} size={12} />
          )}
          <span className={styles.conversationLastMessageTime}>
            {getLastMessageSentTime(conversation.lastMessageSentAt)}
          </span>
          <button
            className={styles.pinButton}
            title={conversation.isPinned ? "Bỏ ghim hội thoại" : "Ghim hội thoại"}
            onClick={togglePinned}
          >
            {conversation.isPinned ? <BsPinAngleFill /> : <BsPin />}
          </button>
        </div>

        <div className={styles.conversationPreviewRow}>
          <span
            className={classNames(
              styles.conversationLastMessage,
              hasUnread && styles.conversationLastMessageUnread
            )}
          >
            {user?.id === conversation.lastMessageSent.author?.id && "Bạn: "}
            {lastMessagePreview()}
          </span>
          {hasUnread && (
            <span className={styles.unreadBadge}>
              {unreadCount > UNREAD_BADGE_MAX
                ? `${UNREAD_BADGE_MAX}+`
                : unreadCount}
            </span>
          )}
        </div>
      </ConversationSidebarItemDetails>
    </ConversationSidebarItemStyle>
  );
};
