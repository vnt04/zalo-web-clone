import React from "react";
import classNames from "classnames";
import styles from "./index.module.scss";

interface ConversationSidebarItemStyleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  children?: React.ReactNode;
}

export const ConversationSidebarItemStyle: React.FC<
  ConversationSidebarItemStyleProps
> = ({ selected = false, children, className, ...rest }) => {
  return (
    <div
      className={classNames(
        styles.sidebarItem,
        selected && styles.sidebarItemSelected,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

interface ConversationSidebarItemDetailsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const ConversationSidebarItemDetails: React.FC<
  ConversationSidebarItemDetailsProps
> = ({ className, children, ...rest }) => {
  return (
    <div className={classNames(styles.details, className)} {...rest}>
      {children}
    </div>
  );
};

interface ConversationChannelPageStyleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const ConversationChannelPageStyle: React.FC<
  ConversationChannelPageStyleProps
> = ({ className, children, ...rest }) => {
  return (
    <div className={classNames(styles.channelPage, className)} {...rest}>
      {children}
    </div>
  );
};
