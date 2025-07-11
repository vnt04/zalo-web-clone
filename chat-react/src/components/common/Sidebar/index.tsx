import React from "react";
import styles from "./index.module.scss";
import classNames from "classnames";

interface SidebarStyleProps {
  children: React.ReactNode;
  className?: string;
}

interface SidebarHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarStyle: React.FC<SidebarStyleProps> = ({
  children,
  className,
}) => {
  return (
    <div className={classNames(styles.sidebarStyle, className)}>{children}</div>
  );
};

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <header className={classNames(styles.sidebarHeader, className)}>
      {children}
    </header>
  );
};
