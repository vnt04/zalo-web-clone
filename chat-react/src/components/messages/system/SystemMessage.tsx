import { FC } from "react";
import { RiAlertFill, RiInformationLine } from "react-icons/ri";
import { SystemMessageLevel, SystemMessageType } from "../../../utils/types";
import styles from "../index.module.scss";

type Props = {
  message: SystemMessageType;
};

const getSystemIcon = (type: SystemMessageLevel) => {
  switch (type) {
    case "info":
      return RiInformationLine;
    case "warning":
    case "error":
      return RiAlertFill;
  }
};

export const SystemMessage: FC<Props> = ({ message }) => {
  const { content, level } = message;
  const Icon = getSystemIcon(level);

  return (
    <div className={styles.systemMessage}>
      <div className={styles.systemMessageHeader}>
        <Icon size={14} />
        <span>Thông báo hệ thống</span>
      </div>
      <span>{content}</span>
    </div>
  );
};
