import { FC, ReactNode } from "react";
import classNames from "classnames";
import defaultAvatar from "../../../__assets__/default_avatar.jpg";
import styles from "./index.module.scss";

type Props = {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  /** Ô chọn hoặc icon đứng trước avatar. */
  leading?: ReactNode;
  /** Nút đứng cuối dòng. Tách khỏi vùng bấm của dòng để không lồng button. */
  action?: ReactNode;
  isOnline?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
};

export const UserRow: FC<Props> = ({
  name,
  subtitle,
  avatarUrl,
  leading,
  action,
  isOnline,
  onClick,
  onContextMenu,
  className,
}) => {
  const content = (
    <>
      <span className={styles.avatarWrap}>
        <img className={styles.avatar} src={avatarUrl ?? defaultAvatar} alt="" />
        {isOnline && <span className={styles.onlineDot} />}
      </span>
      <div className={styles.text}>
        <span className={styles.name}>{name}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </>
  );

  return (
    <div
      className={classNames(
        styles.row,
        { [styles.clickable]: Boolean(onClick) },
        className
      )}
      onContextMenu={onContextMenu}
    >
      {leading}
      {onClick ? (
        <button type="button" className={styles.main} onClick={onClick}>
          {content}
        </button>
      ) : (
        <div className={styles.main}>{content}</div>
      )}
      {action}
    </div>
  );
};
