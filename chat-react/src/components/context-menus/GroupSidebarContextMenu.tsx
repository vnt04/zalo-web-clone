import { FC, useContext } from "react";
import { IoMdExit } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  leaveGroupThunk,
  setShowEditGroupModal,
  toggleContextMenu,
} from "../../store/groupSlice";
import { AuthContext } from "../../utils/context/AuthContext";
import { ContextMenu, ContextMenuItem } from "../common/ContextMenu";

export const GroupSidebarContextMenu: FC = () => {
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch<AppDispatch>();
  const points = useSelector((state: RootState) => state.groups.points);
  const group = useSelector(
    (state: RootState) => state.groups.selectedGroupContextMenu
  );

  const leaveGroup = () => {
    if (!group) return;
    dispatch(leaveGroupThunk(group.id)).finally(() =>
      dispatch(toggleContextMenu(false))
    );
  };

  return (
    <ContextMenu top={points.y} left={points.x}>
      {user?.id === group?.owner.id && (
        <ContextMenuItem
          icon={<MdEdit size={18} />}
          onClick={() => dispatch(setShowEditGroupModal(true))}
        >
          Thông tin nhóm
        </ContextMenuItem>
      )}
      <ContextMenuItem icon={<IoMdExit size={18} />} danger onClick={leaveGroup}>
        Rời nhóm
      </ContextMenuItem>
    </ContextMenu>
  );
};
