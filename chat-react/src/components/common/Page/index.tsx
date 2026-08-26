import { FC, PropsWithChildren } from "react";
import classNames from "classnames";
import styles from "./index.module.scss";

type Props = {
  /** Canh giữa nội dung — dùng cho hai màn xác thực. */
  centered?: boolean;
  className?: string;
};

export const Page: FC<PropsWithChildren<Props>> = ({
  centered,
  className,
  children,
}) => {
  return (
    <div
      className={classNames(styles.page, { [styles.centered]: centered }, className)}
    >
      {children}
    </div>
  );
};
