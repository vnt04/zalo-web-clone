import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { GroupMessageType, MessageType } from "../../utils/types";
import { MessageItemAttachmentContainer } from "./attachments/MessageItemAttachmentContainer";
import { EditMessageContainer } from "./EditMessageContainer";
import { MessageItemContent } from "../common/Message";
import { getMessageSentTime } from "../../utils/helpers";

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
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span>{message.content || null}</span>
            <span style={{ color: "var(--text)", fontSize: "14px" }}>
              {getMessageSentTime(message.createdAt) || null}
            </span>
          </div>
          <MessageItemAttachmentContainer message={message} />
        </MessageItemContent>
      )}
    </>
  );
};
