import { Dispatch, FC, SetStateAction, useState } from "react";
import { MessageTextField } from "../inputs/MessageTextField";
import styles from "./index.module.scss";
import { BsCardText, BsEmojiSmile, BsLightningCharge } from "react-icons/bs";
import { FaRegAddressCard } from "react-icons/fa";
import { IoIosMore } from "react-icons/io";
import { IoAttachOutline, IoSend } from "react-icons/io5";
import {
  MdCropFree,
  MdKeyboardArrowDown,
  MdOutlineEmojiEmotions,
  MdOutlineImage,
  MdOutlineTextFields,
} from "react-icons/md";
import { MessageAttachmentActionIcon } from "./MessageAttachmentActionIcon";
import {
  MessageInputBody,
  MessageInputContainer,
  MessageInputHeader,
} from "../common/Message";

type Props = {
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  placeholderName: string;
  sendMessage: (overrideContent?: string) => void;
  sendTypingStatus: () => void;
};

const ICON_SIZE = 20;
const MAX_LENGTH = 2048;
// Nút thumbs-up của Zalo gửi thẳng biểu tượng này chứ không mở bảng emoji.
const QUICK_REACTION = "👍";

export const MessageInputField: FC<Props> = ({
  content,
  setContent,
  placeholderName,
  sendMessage,
  sendTypingStatus,
}) => {
  const [isMultiLine, setIsMultiLine] = useState(false);
  const atMaxLength = content.length === MAX_LENGTH;
  const hasContent = content.trim().length > 0;

  return (
    <MessageInputContainer isMultiLine={isMultiLine}>
      <MessageInputHeader className={styles.toolbar}>
        <button className={styles.toolbarButton} title="Sticker">
          <MdOutlineEmojiEmotions size={ICON_SIZE} />
        </button>
        <MessageAttachmentActionIcon />
        <button className={styles.toolbarButton} title="Gửi hình ảnh">
          <MdOutlineImage size={ICON_SIZE} />
        </button>
        <button className={styles.toolbarButton} title="Đính kèm file">
          <IoAttachOutline size={ICON_SIZE} />
        </button>
        <button className={styles.toolbarButton} title="Gửi danh thiếp">
          <FaRegAddressCard size={ICON_SIZE} />
        </button>
        <button className={styles.toolbarButton} title="Chụp màn hình">
          <MdCropFree size={ICON_SIZE} />
          <MdKeyboardArrowDown size={14} />
        </button>
        <button className={styles.toolbarButton} title="Định dạng chữ">
          <MdOutlineTextFields size={ICON_SIZE} />
        </button>
        <button className={styles.toolbarButton} title="Tin nhắn nhanh">
          <BsLightningCharge size={ICON_SIZE} />
        </button>
        <button className={styles.toolbarButton} title="Danh thiếp">
          <BsCardText size={ICON_SIZE} />
        </button>
        <button className={styles.toolbarButton} title="Thêm">
          <IoIosMore size={ICON_SIZE} />
        </button>
      </MessageInputHeader>

      <MessageInputBody className={styles.inputRow}>
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
        >
          <MessageTextField
            message={content}
            placeholder={`Nhập @, tin nhắn tới ${placeholderName}`}
            setMessage={setContent}
            maxLength={MAX_LENGTH}
            setIsMultiLine={setIsMultiLine}
            sendTypingStatus={sendTypingStatus}
            sendMessage={sendMessage}
          />
        </form>
        <div className={styles.inputActions}>
          <button className={styles.toolbarButton} title="Biểu tượng cảm xúc">
            <BsEmojiSmile size={ICON_SIZE} />
          </button>
          {hasContent ? (
            <button
              className={styles.sendButton}
              title="Gửi"
              onClick={() => sendMessage()}
            >
              <IoSend size={ICON_SIZE} />
            </button>
          ) : (
            <button
              className={styles.likeButton}
              title="Gửi nhanh"
              onClick={() => sendMessage(QUICK_REACTION)}
            >
              {QUICK_REACTION}
            </button>
          )}
        </div>
      </MessageInputBody>

      {atMaxLength && (
        <span className={styles.characterLimit}>
          {`${content.length}/${MAX_LENGTH}`}
        </span>
      )}
    </MessageInputContainer>
  );
};
