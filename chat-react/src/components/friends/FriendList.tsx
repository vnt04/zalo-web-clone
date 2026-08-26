import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  setContextMenuLocation,
  setSelectedFriend,
  toggleContextMenu,
} from "../../store/friends/friendsSlice";
import { ContextMenuEvent, Friend } from "../../utils/types";
import { FriendContextMenu } from "../context-menus/FriendContextMenu";
import { FriendListItem } from "./FriendListItem";
import styles from "./index.module.scss";

export const FriendList = () => {
  const { showContextMenu, friends, onlineFriends } = useSelector(
    (state: RootState) => state.friends
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleClick = () => dispatch(toggleContextMenu(false));
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [dispatch]);

  const onContextMenu = (e: ContextMenuEvent, friend: Friend) => {
    e.preventDefault();
    dispatch(toggleContextMenu(true));
    dispatch(setContextMenuLocation({ x: e.pageX, y: e.pageY }));
    dispatch(setSelectedFriend(friend));
  };

  const offlineFriends = friends.filter(
    (friend) => !onlineFriends.some((online) => online.id === friend.id)
  );

  return (
    <div className={styles.list}>
      {friends.length === 0 && (
        <p className={styles.emptyState}>
          Bạn chưa có người bạn nào. Bấm "Thêm bạn" để bắt đầu.
        </p>
      )}

      {onlineFriends.length > 0 && (
        <>
          <h3 className={styles.groupTitle}>
            Đang hoạt động ({onlineFriends.length})
          </h3>
          {onlineFriends.map((friend) => (
            <FriendListItem
              key={friend.id}
              friend={friend}
              online
              onContextMenu={onContextMenu}
            />
          ))}
        </>
      )}

      {offlineFriends.length > 0 && (
        <>
          <h3 className={styles.groupTitle}>
            Ngoại tuyến ({offlineFriends.length})
          </h3>
          {offlineFriends.map((friend) => (
            <FriendListItem
              key={friend.id}
              friend={friend}
              online={false}
              onContextMenu={onContextMenu}
            />
          ))}
        </>
      )}

      {showContextMenu && <FriendContextMenu />}
    </div>
  );
};
