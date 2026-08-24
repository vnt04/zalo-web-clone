import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../store";
import { toggleInfoPanel } from "../../store/conversationInfoSlice";
import {
  selectConversationById,
  updateConversationStateThunk,
} from "../../store/conversationSlice";
import { selectConversationMessage } from "../../store/messages/messageSlice";
import { CDN_URL } from "../../utils/constants";
import { AuthContext } from "../../utils/context/AuthContext";
import { getRecipientFromConversation } from "../../utils/helpers";
import { UserAvatar } from "../users/UserAvatar";
import styles from "./index.module.scss";

// Chỉ dựng những mục có dữ liệu thật. Các mục khác của Zalo (nhắc hẹn, tin nhắn
// tự xoá, ẩn trò chuyện) chưa có gì ở backend nên không dựng khung rỗng.
const PREVIEW_LIMIT = 8;
const URL_PATTERN = /https?:\/\/[^\s]+/g;

export const ConversationInfoPanel = () => {
  const { id } = useParams();
  const conversationId = parseInt(id!);
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch<AppDispatch>();

  const conversation = useSelector((state: RootState) =>
    selectConversationById(state, conversationId)
  );
  const conversationMessages = useSelector((state: RootState) =>
    selectConversationMessage(state, conversationId)
  );

  const recipient = getRecipientFromConversation(conversation, user);
  const messages = conversationMessages?.messages ?? [];

  const attachmentKeys = messages
    .flatMap((message) => message.attachments ?? [])
    .map((attachment) => attachment.key);

  const links = messages
    .flatMap((message) => message.content?.match(URL_PATTERN) ?? [])
    .filter((link, index, all) => all.indexOf(link) === index);

  const updateState = (params: { isPinned?: boolean; isMuted?: boolean }) =>
    dispatch(updateConversationStateThunk({ id: conversationId, ...params }));

  return (
    <aside className={styles.infoPanel}>
      <header className={styles.infoHeader}>
        <span className={styles.infoHeaderTitle}>Thông tin hội thoại</span>
      </header>

      <div className={styles.infoScroll}>
        <section className={styles.infoIdentity}>
          {recipient && <UserAvatar user={recipient} />}
          <span className={styles.infoName}>
            {`${recipient?.lastName ?? ""} ${recipient?.firstName ?? ""}`.trim()}
          </span>
        </section>

        <section className={styles.infoSection}>
          <h3 className={styles.infoSectionTitle}>Ảnh/Video</h3>
          {attachmentKeys.length ? (
            <div className={styles.infoMediaGrid}>
              {attachmentKeys.slice(0, PREVIEW_LIMIT).map((key) => (
                <img
                  key={key}
                  className={styles.infoMediaItem}
                  src={CDN_URL.PREVIEW.concat(key)}
                  alt="ảnh đã gửi"
                />
              ))}
            </div>
          ) : (
            <p className={styles.infoEmpty}>
              Chưa có ảnh nào được chia sẻ trong hội thoại này
            </p>
          )}
        </section>

        <section className={styles.infoSection}>
          <h3 className={styles.infoSectionTitle}>Link</h3>
          {links.length ? (
            <ul className={styles.infoLinkList}>
              {links.slice(0, PREVIEW_LIMIT).map((link) => (
                <li key={link}>
                  <a
                    className={styles.infoLink}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.infoEmpty}>
              Chưa có link nào được chia sẻ trong hội thoại này
            </p>
          )}
        </section>

        <section className={styles.infoSection}>
          <h3 className={styles.infoSectionTitle}>Thiết lập</h3>
          <label className={styles.infoToggleRow}>
            <span>Ghim hội thoại</span>
            <input
              type="checkbox"
              checked={Boolean(conversation?.isPinned)}
              onChange={(event) =>
                updateState({ isPinned: event.target.checked })
              }
            />
          </label>
          <label className={styles.infoToggleRow}>
            <span>Tắt thông báo</span>
            <input
              type="checkbox"
              checked={Boolean(conversation?.isMuted)}
              onChange={(event) =>
                updateState({ isMuted: event.target.checked })
              }
            />
          </label>
        </section>
      </div>

      <button
        className={styles.infoClose}
        title="Đóng"
        onClick={() => dispatch(toggleInfoPanel())}
      >
        Đóng
      </button>
    </aside>
  );
};
