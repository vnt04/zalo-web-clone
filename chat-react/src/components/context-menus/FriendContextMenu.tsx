import { useContext } from "react";
import { MdOutlineTextsms, MdPersonRemove } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../store";
import { toggleContextMenu } from "../../store/friends/friendsSlice";
import { removeFriendThunk } from "../../store/friends/friendsThunk";
import { checkConversationOrCreate } from "../../utils/api";
import { AuthContext } from "../../utils/context/AuthContext";
import { SocketContext } from "../../utils/context/SocketContext";
import { useToast } from "../../utils/hooks/useToast";
import { ContextMenu, ContextMenuItem } from "../common/ContextMenu";

export const FriendContextMenu = () => {
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { points, selectedFriendContextMenu } = useSelector(
    (state: RootState) => state.friends
  );
  const socket = useContext(SocketContext);
  const { error } = useToast();

  const peer =
    user?.id === selectedFriendContextMenu?.sender.id
      ? selectedFriendContextMenu?.receiver
      : selectedFriendContextMenu?.sender;

  const removeFriend = () => {
    if (!selectedFriendContextMenu) return;
    dispatch(toggleContextMenu(false));
    dispatch(removeFriendThunk(selectedFriendContextMenu.id)).then(() =>
      socket.emit("getOnlineFriends")
    );
  };

  const sendMessage = async () => {
    if (!peer) return;
    try {
      const { data } = await checkConversationOrCreate(peer.id);
      navigate(`/conversations/${data.id}`);
    } catch {
      error("Không mở được cuộc trò chuyện");
    }
  };

  return (
    <ContextMenu top={points.y} left={points.x}>
      <ContextMenuItem icon={<MdOutlineTextsms size={18} />} onClick={sendMessage}>
        Nhắn tin
      </ContextMenuItem>
      <ContextMenuItem
        icon={<MdPersonRemove size={18} />}
        danger
        onClick={removeFriend}
      >
        Xoá bạn
      </ContextMenuItem>
    </ContextMenu>
  );
};
