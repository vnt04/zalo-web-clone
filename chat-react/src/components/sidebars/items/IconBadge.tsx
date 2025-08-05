import React from "react";
import styles from "./index.module.scss";
import classNames from "classnames";

type IconBadgeProps = {
  className?: string;
  children?: React.ReactNode;
};

export const IconBadge: React.FC<IconBadgeProps> = ({
  className,
  children,
}) => {
  return (
    <div className={classNames(styles.iconBadge, className)}>{children}</div>
  );
};
