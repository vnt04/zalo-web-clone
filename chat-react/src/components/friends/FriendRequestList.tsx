import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { FriendRequestItem } from "./FriendRequestItem";
import styles from "./index.module.scss";

export const FriendRequestList = () => {
  const friendRequests = useSelector(
    (state: RootState) => state.friends.friendRequests
  );

  return (
    <div className={styles.list}>
      {friendRequests.length === 0 ? (
        <p className={styles.emptyState}>Không có lời mời kết bạn nào.</p>
      ) : (
        friendRequests.map((friendRequest) => (
          <FriendRequestItem
            key={friendRequest.id}
            friendRequest={friendRequest}
          />
        ))
      )}
    </div>
  );
};
