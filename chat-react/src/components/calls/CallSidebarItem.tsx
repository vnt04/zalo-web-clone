import { FC, useContext } from "react";
import { IoMdCall, IoMdVideocam } from "react-icons/io";
import { AuthContext } from "../../utils/context/AuthContext";
import { formatPhoneNumber, getUserFriendInstance } from "../../utils/helpers";
import { Friend } from "../../utils/types";
import { UserRow } from "../common/UserRow";
import styles from "./index.module.scss";

type Props = {
  friend: Friend;
  onVoiceCall: (peerId: number) => void;
  onVideoCall: (peerId: number) => void;
};

export const CallSidebarItem: FC<Props> = ({
  friend,
  onVoiceCall,
  onVideoCall,
}) => {
  const { user } = useContext(AuthContext);
  const peer = getUserFriendInstance(user!, friend);

  return (
    <UserRow
      avatarUrl={peer.profile?.avatar}
      name={`${peer.firstName} ${peer.lastName}`}
      subtitle={formatPhoneNumber(peer.phoneNumber)}
      action={
        <div className={styles.callActions}>
          <button
            type="button"
            className={styles.callAction}
            title="Gọi thoại"
            onClick={() => onVoiceCall(peer.id)}
          >
            <IoMdCall size={20} />
          </button>
          <button
            type="button"
            className={styles.callAction}
            title="Gọi video"
            onClick={() => onVideoCall(peer.id)}
          >
            <IoMdVideocam size={20} />
          </button>
        </div>
      }
    />
  );
};
