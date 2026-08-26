import { FC, useState } from "react";
import { MdClose } from "react-icons/md";
import { useKeydown } from "../../../utils/hooks";
import { GroupMessageType, MessageType } from "../../../utils/types";
import styles from "./index.module.scss";

type Props = {
  message: MessageType | GroupMessageType;
};

export const MessageItemAttachmentContainer: FC<Props> = ({ message }) => {
  const [imageUrl, setImageUrl] = useState("");

  useKeydown((e: KeyboardEvent) => e.key === "Escape" && setImageUrl(""));

  return (
    <>
      {imageUrl && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-label="Xem ảnh"
          onMouseDown={(e) => e.target === e.currentTarget && setImageUrl("")}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            aria-label="Đóng"
            onClick={() => setImageUrl("")}
          >
            <MdClose size={24} />
          </button>
          <img className={styles.lightboxImage} src={imageUrl} alt="" />
        </div>
      )}
      <div className={styles.attachmentGrid}>
        {message.attachments?.map((attachment) => (
          <button
            type="button"
            key={attachment.key}
            className={styles.attachmentThumb}
            onClick={() => setImageUrl(attachment.url)}
          >
            <img src={attachment.url} alt="" />
          </button>
        ))}
      </div>
    </>
  );
};
