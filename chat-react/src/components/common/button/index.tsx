import React from "react";
import styles from "./index.module.scss";
import classNames from "classnames";

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
