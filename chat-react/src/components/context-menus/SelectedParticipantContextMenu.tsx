import { FC, useContext } from "react";
import { LuCrown, LuUserX } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../store";
import {
  removeGroupRecipientThunk,
  selectGroupById,
  updateGroupOwnerThunk,
} from "../../store/groupSlice";
import { AuthContext } from "../../utils/context/AuthContext";
import { isGroupOwner } from "../../utils/helpers";
import { ContextMenu, ContextMenuItem } from "../common/ContextMenu";

type Props = {
  points: { x: number; y: number };
};

export const SelectedParticipantContextMenu: FC<Props> = ({ points }) => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch<AppDispatch>();
  const selectedUser = useSelector(
    (state: RootState) => state.groupSidebar.selectedUser
  );
  const group = useSelector((state: RootState) =>
    selectGroupById(state, parseInt(id!))
  );

  const canManage = isGroupOwner(user, group) && user?.id !== selectedUser?.id;

  const kickUser = () => {
    if (!selectedUser) return;
    dispatch(
      removeGroupRecipientThunk({ id: parseInt(id!), userId: selectedUser.id })
    );
  };

  const transferGroupOwner = () => {
    if (!selectedUser) return;
    dispatch(
      updateGroupOwnerThunk({ id: parseInt(id!), newOwnerId: selectedUser.id })
    );
  };

  if (!canManage) return null;

  return (
    <ContextMenu top={points.y} left={points.x}>
      <ContextMenuItem
        icon={<LuCrown size={18} color="var(--zl-gold)" />}
        onClick={transferGroupOwner}
      >
        Chuyển quyền trưởng nhóm
      </ContextMenuItem>
      <ContextMenuItem
        icon={<LuUserX size={18} />}
        danger
        onClick={kickUser}
      >
        Xoá khỏi nhóm
      </ContextMenuItem>
    </ContextMenu>
  );
};
