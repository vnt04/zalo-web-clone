import React from "react";
import styles from "./index.module.scss";
import classNames from "classnames";

interface InputContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  backgroundColor?: string;
}

export const InputContainer: React.FC<InputContainerProps> = ({
  children,
  className,
  backgroundColor,
  ...rest
}) => {
  return (
    <div
      className={classNames(styles.inputContainer, className)}
      style={{ backgroundColor }}
      {...rest}
    >
      {children}
    </div>
  );
};

interface InputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const InputLabel: React.FC<InputLabelProps> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <label className={classNames(styles.inputLabel, className)} {...rest}>
      {children}
    </label>
  );
};

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={classNames(styles.inputField, className)}
        {...props}
      />
    );
  }
);
