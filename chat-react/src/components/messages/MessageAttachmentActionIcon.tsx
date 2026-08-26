import { IoImageOutline } from "react-icons/io5";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  addAttachment,
  incrementAttachmentCounter,
} from "../../store/message-panel/messagePanelSlice";
import { useToast } from "../../utils/hooks/useToast";
import { InputChangeEvent } from "../../utils/types";
import styles from "./index.module.scss";

const MAX_ATTACHMENTS = 5;

export const MessageAttachmentActionIcon = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useToast();
  const { attachmentCounter, attachments } = useSelector(
    (state: RootState) => state.messagePanel
  );

  const onChange = (e: InputChangeEvent) => {
    const { files } = e.target;
    if (!files) return;
    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining === 0)
      return error(`Chỉ đính kèm được tối đa ${MAX_ATTACHMENTS} ảnh`);

    Array.from(files)
      .slice(0, remaining)
      .forEach((file, index) => {
        dispatch(addAttachment({ id: attachmentCounter + index, file }));
        dispatch(incrementAttachmentCounter());
      });
  };

  return (
    <button
      type="button"
      className={styles.toolbarButton}
      title="Gửi ảnh đính kèm"
      onClick={() => fileInputRef.current?.click()}
    >
      <IoImageOutline size={20} className={styles.icon} />
      <input
        className={styles.hiddenFileInput}
        multiple
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
      />
    </button>
  );
};
