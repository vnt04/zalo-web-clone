import React from "react";
import styles from "./index.module.scss";
import classNames from "classnames";
import { MdClose } from "react-icons/md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  backgroundColor?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  backgroundColor,
  ...rest
}) => {
  return (
    <button
      className={classNames(styles.button, className)}
      style={{ backgroundColor }}
      {...rest}
    >
      {children}
    </button>
  );
};

interface CloseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  size = 24,
  className,
  ...rest
}) => {
  return (
    <button className={classNames(styles.closeButton, className)} {...rest}>
      <MdClose size={size} color="gray" />
    </button>
  );
};
