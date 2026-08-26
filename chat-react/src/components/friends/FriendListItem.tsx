import { FC, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { checkConversationOrCreate } from "../../utils/api";
import { AuthContext } from "../../utils/context/AuthContext";
import { formatPhoneNumber } from "../../utils/helpers";
import { useToast } from "../../utils/hooks/useToast";
import { ContextMenuEvent, Friend } from "../../utils/types";
import { UserRow } from "../common/UserRow";

type Props = {
  friend: Friend;
  online: boolean;
  onContextMenu: (e: ContextMenuEvent, friend: Friend) => void;
};

export const FriendListItem: FC<Props> = ({
  friend,
  online,
  onContextMenu,
}) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { error } = useToast();
  const peer = user?.id === friend.sender.id ? friend.receiver : friend.sender;
  const statusMessage = online ? peer.presence?.statusMessage : undefined;

  const openConversation = async () => {
    try {
      const { data } = await checkConversationOrCreate(peer.id);
      navigate(`/conversations/${data.id}`);
    } catch {
      error("Không mở được cuộc trò chuyện");
    }
  };

  return (
    <UserRow
      avatarUrl={peer.profile?.avatar}
      name={`${peer.firstName} ${peer.lastName}`}
      subtitle={statusMessage || formatPhoneNumber(peer.phoneNumber)}
      isOnline={online}
      onClick={openConversation}
      onContextMenu={(e) => onContextMenu(e, friend)}
    />
  );
};
