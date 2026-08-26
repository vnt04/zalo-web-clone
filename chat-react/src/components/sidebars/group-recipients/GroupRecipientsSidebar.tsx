import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../../store";
import {
  setContextMenuLocation,
  setSelectedUser,
  toggleContextMenu,
} from "../../../store/groupRecipientsSidebarSlice";
import { selectGroupById } from "../../../store/groupSlice";
import { SocketContext } from "../../../utils/context/SocketContext";
import { ContextMenuEvent, User } from "../../../utils/types";
import { SelectedParticipantContextMenu } from "../../context-menus/SelectedParticipantContextMenu";
import styles from "../../groups/index.module.scss";
import { OfflineGroupRecipients } from "./OfflineGroupRecipients";
import { OnlineGroupRecipients } from "./OnlineGroupRecipients";

const ONLINE_POLL_MS = 5000;

export const GroupRecipientsSidebar = () => {
  const { id: groupId } = useParams();
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const socket = useContext(SocketContext);
  const group = useSelector((state: RootState) =>
    selectGroupById(state, parseInt(groupId!))
  );
  const groupSidebarState = useSelector(
    (state: RootState) => state.groupSidebar
  );

  useEffect(() => {
    const handleClick = () => dispatch(toggleContextMenu(false));
    const handleResize = () => dispatch(toggleContextMenu(false));
    window.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  useEffect(() => {
    socket.emit("getOnlineGroupUsers", { groupId });
    const interval = setInterval(
      () => socket.emit("getOnlineGroupUsers", { groupId }),
      ONLINE_POLL_MS
    );
    socket.on("onlineGroupUsersReceived", (payload) =>
      setOnlineUsers(payload.onlineUsers)
    );
    return () => {
      clearInterval(interval);
      socket.off("onlineGroupUsersReceived");
    };
  }, [group, groupId]);

  const onUserContextMenu = (e: ContextMenuEvent, user: User) => {
    e.preventDefault();
    dispatch(toggleContextMenu(true));
    dispatch(setContextMenuLocation({ x: e.pageX, y: e.pageY }));
    dispatch(setSelectedUser(user));
  };

  const offlineCount = (group?.users.length ?? 0) - onlineUsers.length;

  return (
    <aside className={styles.recipientsSidebar}>
      <div className={styles.recipientsHeader}>Thành viên nhóm</div>
      <div className={styles.recipientsBody}>
        {onlineUsers.length > 0 && (
          <>
            <h3 className={styles.groupTitle}>
              Đang hoạt động ({onlineUsers.length})
            </h3>
            <OnlineGroupRecipients
              users={onlineUsers}
              group={group}
              onUserContextMenu={onUserContextMenu}
            />
          </>
        )}
        {offlineCount > 0 && (
          <>
            <h3 className={styles.groupTitle}>Ngoại tuyến ({offlineCount})</h3>
            <OfflineGroupRecipients
              onlineUsers={onlineUsers}
              group={group}
              onUserContextMenu={onUserContextMenu}
            />
          </>
        )}
        {groupSidebarState.showUserContextMenu && (
          <SelectedParticipantContextMenu points={groupSidebarState.points} />
        )}
      </div>
    </aside>
  );
};
