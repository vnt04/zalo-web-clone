import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { fetchFriendsThunk } from "../../../store/friends/friendsThunk";
import { checkConversationOrCreate } from "../../../utils/api";
import { AuthContext } from "../../../utils/context/AuthContext";
import { getUserFriendInstance } from "../../../utils/helpers";
import { useStartCall } from "../../../utils/hooks/useStartCall";
import { useToast } from "../../../utils/hooks/useToast";
import { CallType, Friend } from "../../../utils/types";
import { CallSidebarItem } from "../../calls/CallSidebarItem";
import styles from "../../calls/index.module.scss";

export const CallsSidebar = () => {
  const { friends } = useSelector((state: RootState) => state.friends);
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch<AppDispatch>();
  const { startVoiceCall, startVideoCall } = useStartCall();
  const { error } = useToast();

  useEffect(() => {
    dispatch(fetchFriendsThunk());
  }, [dispatch]);

  // Cuộc gọi cần conversationId, mà danh sách bạn bè không có sẵn, nên phải hỏi
  // API lấy (hoặc tạo) hội thoại trước khi bắt đầu.
  const callFriend = async (friend: Friend, callType: CallType) => {
    const recipient = getUserFriendInstance(user!, friend);
    try {
      const { data } = await checkConversationOrCreate(recipient.id);
      const params = { conversationId: data.id, recipient };
      return callType === "video"
        ? startVideoCall(params)
        : startVoiceCall(params);
    } catch {
      error("Không bắt đầu được cuộc gọi");
    }
  };

  return (
    <aside className={styles.callsSidebar}>
      <div className={styles.sidebarHeader}>Cuộc gọi</div>
      <div className={styles.friendList}>
        {friends.length === 0 ? (
          <p className={styles.emptyState}>
            Bạn chưa có người bạn nào để gọi.
          </p>
        ) : (
          friends.map((friend) => (
            <CallSidebarItem
              key={friend.id}
              friend={friend}
              onVoiceCall={() => callFriend(friend, "audio")}
              onVideoCall={() => callFriend(friend, "video")}
            />
          ))
        )}
      </div>
    </aside>
  );
};
