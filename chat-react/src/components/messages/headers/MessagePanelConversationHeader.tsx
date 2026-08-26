import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../../../store";
import { selectConversationById } from "../../../store/conversationSlice";
import { AuthContext } from "../../../utils/context/AuthContext";
import { getRecipientFromConversation } from "../../../utils/helpers";
import { useStartCall } from "../../../utils/hooks/useStartCall";
import { MessagePanelHeaderStyle } from "../../common/Message";
import styles from "./index.module.scss";
import { UserAvatar } from "../../users/UserAvatar";
import { FiPhone, FiSearch, FiSidebar, FiVideo } from "react-icons/fi";
import { toggleInfoPanel } from "../../../store/conversationInfoSlice";
import classNames from "classnames";

export const MessagePanelConversationHeader = () => {
  const user = useContext(AuthContext).user!;
  const { id } = useParams();

  const dispatch = useDispatch();
  const conversation = useSelector((state: RootState) =>
    selectConversationById(state, parseInt(id!))
  );
  const showInfoPanel = useSelector(
    (state: RootState) => state.conversationInfo.showInfoPanel
  );

  const recipient = getRecipientFromConversation(conversation, user);
  const { startVoiceCall, startVideoCall } = useStartCall();

  const callParams =
    conversation && recipient
      ? { conversationId: conversation.id, recipient }
      : undefined;

  return (
    <MessagePanelHeaderStyle>
      <div className={styles.messagePanelHeader}>
        <UserAvatar user={recipient!} />
        <span className={styles.headerName}>
          {`${recipient?.lastName} ${recipient?.firstName}`.trim() || "User"}
        </span>
      </div>
      <div className={styles.headerActions}>
        <button
          className={styles.headerAction}
          title="Gọi thoại"
          disabled={!callParams}
          onClick={() => callParams && startVoiceCall(callParams)}
        >
          <FiPhone size={20} />
        </button>
        <button
          className={styles.headerAction}
          title="Gọi video"
          disabled={!callParams}
          onClick={() => callParams && startVideoCall(callParams)}
        >
          <FiVideo size={20} />
        </button>
        <button
          className={styles.headerAction}
          title="Tìm tin nhắn"
          onClick={() => {}}
        >
          <FiSearch size={20} />
        </button>
        <button
          className={classNames(
            styles.headerAction,
            showInfoPanel && styles.headerActionActive
          )}
          title="Thông tin hội thoại"
          onClick={() => dispatch(toggleInfoPanel())}
        >
          <FiSidebar size={20} />
        </button>
      </div>
    </MessagePanelHeaderStyle>
  );
};
