import React, { FC, PropsWithChildren, ReactNode, useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import classNames from "classnames";
import styles from "./index.module.scss";

type ZaloModalProps = {
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  width?: number;
};

export const ZaloModal: FC<PropsWithChildren<ZaloModalProps>> = ({
  title,
  onClose,
  footer,
  width,
  children,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [onClose]);

  // mousedown chứ không phải click: bôi đen chữ trong modal rồi nhả chuột ra nền không được đóng modal.
  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      className={styles.zaloOverlay}
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className={styles.zaloModal}
        style={width ? { width } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className={styles.zaloModalHeader}>
          <h2>{title}</h2>
          <button
            type="button"
            className={styles.zaloModalClose}
            onClick={onClose}
            aria-label="Đóng"
          >
            <MdClose size={22} />
          </button>
        </header>
        <div className={styles.zaloModalBody}>{children}</div>
        {footer ? (
          <footer className={styles.zaloModalFooter}>{footer}</footer>
        ) : null}
      </div>
    </div>
  );
};

type ZaloModalActionProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export const ZaloModalAction: FC<ZaloModalActionProps> = ({
  variant = "secondary",
  className,
  children,
  ...rest
}) => {
  return (
    <button
      type="button"
      className={classNames(styles[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
};
