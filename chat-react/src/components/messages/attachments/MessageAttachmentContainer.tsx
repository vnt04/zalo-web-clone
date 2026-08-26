import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { removeAttachment } from "../../../store/message-panel/messagePanelSlice";
import { Attachment } from "../../../utils/types";
import messageStyles from "../index.module.scss";
import { MessageImageCanvas } from "./MessageImageCanvas";

export const MessageAttachmentContainer = () => {
  const { attachments } = useSelector((state: RootState) => state.messagePanel);
  const dispatch = useDispatch<AppDispatch>();

  if (attachments.length === 0) return null;

  const onDeleteAttachment = (attachment: Attachment) =>
    dispatch(removeAttachment(attachment));

  return (
    <div className={messageStyles.attachmentTray}>
      {attachments.map((attachment) => (
        <div className={messageStyles.attachmentItem} key={attachment.id}>
          <MessageImageCanvas file={attachment.file} />
          <button
            type="button"
            className={messageStyles.attachmentRemove}
            aria-label={`Bỏ ${attachment.file.name}`}
            onClick={() => onDeleteAttachment(attachment)}
          >
            <MdClose size={14} />
          </button>
          <span>{attachment.file.name}</span>
        </div>
      ))}
    </div>
  );
};
