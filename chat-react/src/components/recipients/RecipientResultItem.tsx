import { FC } from "react";
import { User } from "../../utils/types";
import { RecipientResultItemStyle } from ".";
import { UserAvatar } from "../users/UserAvatar";
import styles from "./index.module.scss";

type Props = {
  user: User | undefined;
  onClick: () => void;
};

export const RecipientResultItem: FC<Props> = ({ user, onClick }) => {
  return (
    <RecipientResultItemStyle onClick={onClick}>
      <UserAvatar user={user!} />
      <div className={styles.recipientResultItemHeader}>
        <span className={styles.recipientResultItemName}>
          {`${user?.lastName} ${user?.firstName}`}
        </span>
        <span className={styles.recipientResultItemPhoneNumber}>
          (+84) {user?.username}
        </span>
      </div>
    </RecipientResultItemStyle>
  );
};
