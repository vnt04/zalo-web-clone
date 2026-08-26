import styles from "../../components/friends/index.module.scss";

export const BlockedPage = () => {
  return (
    <div className={styles.list}>
      <p className={styles.emptyState}>Bạn chưa chặn người dùng nào.</p>
    </div>
  );
};
