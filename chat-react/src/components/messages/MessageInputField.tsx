import { Dispatch, FC, SetStateAction, useState } from "react";
import { CharacterLimit } from "../../utils/styles";
import { MessageTextField } from "../inputs/MessageTextField";
import styles from "./index.module.scss";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { IoSend } from "react-icons/io5";
import { IoIosMore } from "react-icons/io";
import { IoAttachOutline } from "react-icons/io5";
import { FaRegAddressCard } from "react-icons/fa";
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
  sendMessage: () => void;
  sendTypingStatus: () => void;
};

export const MessageInputField: FC<Props> = ({
  content,
  setContent,
  sendMessage,
  sendTypingStatus,
}) => {
  const ICON_SIZE = 24;
  const MAX_LENGTH = 2048;
  const [isMultiLine, setIsMultiLine] = useState(false);
  const atMaxLength = content.length === MAX_LENGTH;

  return (
    <MessageInputContainer isMultiLine={isMultiLine}>
      <MessageInputHeader>
        <MdOutlineEmojiEmotions className={styles.icon} size={ICON_SIZE} />
        <MessageAttachmentActionIcon />
        <IoAttachOutline className={styles.icon} size={ICON_SIZE} />
        <FaRegAddressCard className={styles.icon} size={ICON_SIZE} />
        <IoIosMore className={styles.icon} size={ICON_SIZE} />
      </MessageInputHeader>

      <hr />
      <MessageInputBody>
        <form onSubmit={sendMessage} className={styles.form}>
          <MessageTextField
            message={content}
            setMessage={setContent}
            maxLength={MAX_LENGTH}
            setIsMultiLine={setIsMultiLine}
            sendTypingStatus={sendTypingStatus}
            sendMessage={sendMessage}
          />
        </form>
        <MessageInputHeader>
          <MdOutlineEmojiEmotions className={styles.icon} size={ICON_SIZE} />
          <IoSend className={styles.icon} size={ICON_SIZE} color="blue" />
        </MessageInputHeader>
      </MessageInputBody>

      {atMaxLength && (
        <CharacterLimit atMaxLength={atMaxLength}>
          {`${content.length}/${MAX_LENGTH}`}
        </CharacterLimit>
      )}
    </MessageInputContainer>
  );
};
