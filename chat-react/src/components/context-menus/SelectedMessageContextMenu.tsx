import { useContext } from "react";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../store";
import { deleteGroupMessageThunk } from "../../store/groupMessageSlice";
import {
  setIsEditing,
  setMessageBeingEdited,
} from "../../store/messageContainerSlice";
import { deleteMessageThunk } from "../../store/messages/messageThunk";
import { selectType } from "../../store/selectedSlice";
import { AuthContext } from "../../utils/context/AuthContext";
import { ContextMenu, ContextMenuItem } from "../common/ContextMenu";

export const SelectedMessageContextMenu = () => {
  const { id: routeId } = useParams();
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch<AppDispatch>();
  const conversationType = useSelector((state: RootState) => selectType(state));
  const { selectedMessage: message, points } = useSelector(
    (state: RootState) => state.messageContainer
  );

  const isOwnMessage = message?.author.id === user?.id;

  const deleteMessage = () => {
    if (!message) return;
    const id = parseInt(routeId!);
    return conversationType === "private"
      ? dispatch(deleteMessageThunk({ id, messageId: message.id }))
      : dispatch(deleteGroupMessageThunk({ id, messageId: message.id }));
  };

  const editMessage = () => {
    dispatch(setIsEditing(true));
    dispatch(setMessageBeingEdited(message));
  };

  return (
    <ContextMenu top={points.y} left={points.x}>
      {isOwnMessage && (
        <>
          <ContextMenuItem icon={<MdOutlineEdit size={18} />} onClick={editMessage}>
            Chỉnh sửa
          </ContextMenuItem>
          <ContextMenuItem
            icon={<MdDeleteOutline size={18} />}
            danger
            onClick={deleteMessage}
          >
            Thu hồi
          </ContextMenuItem>
        </>
      )}
    </ContextMenu>
  );
};
