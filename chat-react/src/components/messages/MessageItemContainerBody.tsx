import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { GroupMessageType, MessageType } from "../../utils/types";
import { MessageItemAttachmentContainer } from "./attachments/MessageItemAttachmentContainer";
import { EditMessageContainer } from "./EditMessageContainer";
import { MessageItemContent } from "../common/Message";
import { getMessageSentTime } from "../../utils/helpers";
import styles from "./index.module.scss";

type Props = {
  message: MessageType | GroupMessageType;
  onEditMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isOwnerMessage: boolean;
};

export const MessageItemContainerBody: FC<Props> = ({
  message,
  onEditMessageChange,
  isOwnerMessage = false,
}) => {
  const { isEditingMessage, messageBeingEdited } = useSelector(
    (state: RootState) => state.messageContainer
  );

  return (
    <>
      {isEditingMessage && message.id === messageBeingEdited?.id ? (
        <MessageItemContent isOwnerMessage={isOwnerMessage}>
          <EditMessageContainer onEditMessageChange={onEditMessageChange} />
        </MessageItemContent>
      ) : (
        <MessageItemContent isOwnerMessage={isOwnerMessage}>
          <div className={styles.messageItemBody}>
            <span>{message.content || null}</span>
            <span className={styles.messageItemTime}>
              {getMessageSentTime(message.createdAt) || null}
            </span>
          </div>
          <MessageItemAttachmentContainer message={message} />
        </MessageItemContent>
      )}
    </>
  );
};
