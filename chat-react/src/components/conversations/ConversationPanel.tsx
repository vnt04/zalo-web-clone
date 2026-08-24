import { ConversationChannelPageStyle } from "../common/Conversation";
import styles from "./index.module.scss";

export const ConversationPanel = () => {
  return (
    <ConversationChannelPageStyle className={styles.welcomePanel}>
      <div className={styles.welcomeBanner}>
        <WelcomeIllustration />
        <h1 className={styles.welcomeTitle}>Chào mừng đến với Zalo Web!</h1>
        <p className={styles.welcomeText}>
          Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người thân,
          bạn bè được tối ưu cho máy tính của bạn.
        </p>
        <p className={styles.welcomeHint}>
          Chọn một hội thoại ở bên trái để bắt đầu nhắn tin.
        </p>
      </div>
    </ConversationChannelPageStyle>
  );
};

const WelcomeIllustration = () => (
  <svg
    className={styles.welcomeArt}
    viewBox="0 0 240 150"
    role="presentation"
    aria-hidden="true"
  >
    <ellipse cx="120" cy="134" rx="88" ry="10" fill="var(--zl-blue-mist)" />
    <rect
      x="18"
      y="16"
      width="134"
      height="86"
      rx="16"
      fill="#ffffff"
      stroke="#cfe1ff"
      strokeWidth="2"
    />
    <rect x="38" y="40" width="94" height="8" rx="4" fill="#dbe9ff" />
    <rect x="38" y="58" width="72" height="8" rx="4" fill="var(--zl-blue-mist)" />
    <rect x="38" y="76" width="50" height="8" rx="4" fill="var(--zl-blue-mist)" />
    <rect x="112" y="58" width="110" height="66" rx="16" fill="var(--zl-blue)" />
    <rect x="130" y="80" width="74" height="8" rx="4" fill="#ffffff" opacity="0.9" />
    <rect x="130" y="98" width="50" height="8" rx="4" fill="#ffffff" opacity="0.6" />
  </svg>
);
