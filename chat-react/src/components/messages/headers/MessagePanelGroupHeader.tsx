import { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { LuUserPlus, LuUsers } from 'react-icons/lu';
import { RootState, AppDispatch } from '../../../store';
import { toggleSidebar } from '../../../store/groupRecipientsSidebarSlice';
import { selectGroupById } from '../../../store/groupSlice';
import { AuthContext } from '../../../utils/context/AuthContext';
import { MessagePanelHeaderStyle } from '../../common/Message';
import { AddGroupRecipientModal } from '../../modals/AddGroupRecipientModal';
import styles from './index.module.scss';

export const MessagePanelGroupHeader = () => {
  const [showModal, setShowModal] = useState(false);
  const user = useContext(AuthContext).user!;
  const { id } = useParams();
  const group = useSelector((state: RootState) =>
    selectGroupById(state, parseInt(id!))
  );
  const dispatch = useDispatch<AppDispatch>();
  return (
    <>
      {showModal && <AddGroupRecipientModal setShowModal={setShowModal} />}
      <MessagePanelHeaderStyle>
        <div className={styles.messagePanelHeader}>
          <span className={styles.headerName}>{group?.title || 'Group'}</span>
        </div>
        <div className={styles.headerActions}>
          {user?.id === group?.owner?.id && (
            <button
              className={styles.headerAction}
              title="Thêm thành viên"
              onClick={() => setShowModal(true)}
            >
              <LuUserPlus size={20} />
            </button>
          )}
          <button
            className={styles.headerAction}
            title="Thành viên nhóm"
            onClick={() => dispatch(toggleSidebar())}
          >
            <LuUsers size={20} />
          </button>
        </div>
      </MessagePanelHeaderStyle>
    </>
  );
};
