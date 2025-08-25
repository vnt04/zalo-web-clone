import React from "react";
import styles from "./index.module.scss";
import classNames from "classnames";

interface RecipientResultItemProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const RecipientResultItemStyle: React.FC<RecipientResultItemProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      className={classNames(styles.recipientResultItemStyle, className)}
    >
      {children}
    </div>
  );
};

interface RecipientResultContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const RecipientResultContainerStyle: React.FC<
  RecipientResultContainerProps
> = ({ children, className, ...props }) => {
  return (
    <div
      {...props}
      className={classNames(styles.recipientResultContainerStyle, className)}
    >
      {children}
    </div>
  );
};

interface RecipientScrollableItemContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const RecipientScrollableItemContainer: React.FC<
  RecipientScrollableItemContainerProps
> = ({ children, className, ...props }) => {
  return (
    <div
      {...props}
      className={classNames(styles.recipientScrollableItemContainer, className)}
    >
      {children}
    </div>
  );
};
