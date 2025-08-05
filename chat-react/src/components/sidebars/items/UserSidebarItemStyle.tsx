import React from "react";
import styles from "./index.module.scss";
import classNames from "classnames";

interface SidebarItemProps {
  active?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const UserSidebarItemStyle: React.FC<SidebarItemProps> = ({
  active,
  className,
  children,
  onClick,
}) => {
  return (
    <div
      className={classNames(
        styles.userSidebarItem,
        { [styles.active]: active },
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
