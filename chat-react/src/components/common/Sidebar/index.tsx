import React from "react";
import styles from "./index.module.scss";
import classNames from "classnames";

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarStyle: React.FC<SidebarProps> = ({
  children,
  className,
}) => {
  return (
    <div className={classNames(styles.sidebarStyle, className)}>{children}</div>
  );
};

export const SidebarHeader: React.FC<SidebarProps> = ({
  children,
  className,
}) => {
  return (
    <header className={classNames(styles.sidebarHeader, className)}>
      {children}
    </header>
  );
};

export const UserSidebarStyle: React.FC<SidebarProps> = ({
  children,
  className,
}) => {
  return (
    <div className={classNames(styles.userSidebarStyle, className)}>
      {children}
    </div>
  );
};

export const UserSidebarHeader: React.FC<SidebarProps> = ({
  children,
  className,
}) => {
  return (
    <div className={classNames(styles.userSidebarHeader, className)}>
      {children}
    </div>
  );
};

interface UserAvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export const UserAvatarContainer: React.FC<UserAvatarProps> = ({
  className,
  ...props
}) => {
  return (
    <img
      className={classNames(styles.userAvatarContainer, className)}
      {...props}
    />
  );
};

export const UserSidebarScrollableContainer: React.FC<SidebarProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={classNames(
        styles.scrollableContainer,
        styles.userSidebarScrollableContainer,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
