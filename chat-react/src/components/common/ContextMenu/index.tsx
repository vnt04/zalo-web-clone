import { ButtonHTMLAttributes, FC, PropsWithChildren, ReactNode } from "react";
import classNames from "classnames";
import styles from "./index.module.scss";

type ContextMenuProps = {
  top: number;
  left: number;
};

export const ContextMenu: FC<PropsWithChildren<ContextMenuProps>> = ({
  top,
  left,
  children,
}) => {
  return (
    <ul className={styles.contextMenu} style={{ top, left }} role="menu">
      {children}
    </ul>
  );
};

type ContextMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  danger?: boolean;
};

export const ContextMenuItem: FC<ContextMenuItemProps> = ({
  icon,
  danger,
  children,
  className,
  ...rest
}) => {
  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        className={classNames(
          styles.contextMenuItem,
          { [styles.danger]: danger },
          className
        )}
        {...rest}
      >
        {icon}
        <span>{children}</span>
      </button>
    </li>
  );
};
