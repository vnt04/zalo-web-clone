import React, { forwardRef } from "react";
import styles from "./index.module.scss";
import classNames from "classnames";

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  showModal?: boolean;
}

export const ModalContainerStyle: React.FC<
  React.PropsWithChildren<ModalProps>
> = ({ children, showModal, className, ...rest }) => {
  return (
    <div
      className={classNames(styles.modalContainerStyle, className, {
        [styles.show]: showModal,
      })}
      {...rest}
    >
      {children}
    </div>
  );
};

export const ModalHeaderStyle: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
> = ({ children, className, ...rest }) => {
  return (
    <header
      className={classNames(styles.modalHeaderStyle, className)}
      {...rest}
    >
      {children}
    </header>
  );
};

export const ModalContentBodyStyle: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
> = ({ children, className, ...rest }) => {
  return (
    <div
      className={classNames(styles.modalContentBodyStyle, className)}
      {...rest}
    >
      {children}
    </div>
  );
};

export const OverlayStyle = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
>(({ children, className, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={classNames(styles.overlayStyle, className)}
      {...rest}
    >
      {children}
    </div>
  );
});
