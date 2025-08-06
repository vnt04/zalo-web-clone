import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../../../store";
import { initiateCallState } from "../../../store/call/callSlice";
import { selectConversationById } from "../../../store/conversationSlice";
import { SenderEvents } from "../../../utils/constants";
import { AuthContext } from "../../../utils/context/AuthContext";
import { SocketContext } from "../../../utils/context/SocketContext";
import { getRecipientFromConversation } from "../../../utils/helpers";
import { MessagePanelHeaderIcons } from "../../../utils/styles";
import { CallInitiatePayload, CallType } from "../../../utils/types";
import { MessagePanelHeaderStyle } from "../../common/Message";
import styles from "./index.module.scss";
import { UserAvatar } from "../../users/UserAvatar";
import { FiPhone, FiSearch, FiVideo } from "react-icons/fi";

export const MessagePanelConversationHeader = () => {
  const user = useContext(AuthContext).user!;
  const { id } = useParams();
  const socket = useContext(SocketContext);

  const dispatch = useDispatch();
  const conversation = useSelector((state: RootState) =>
    selectConversationById(state, parseInt(id!))
  );

  const recipient = getRecipientFromConversation(conversation, user);

  const buildCallPayloadParams = (
    stream: MediaStream,
    type: CallType
  ): CallInitiatePayload | undefined =>
    conversation && {
      localStream: stream,
      caller: user,
      receiver: recipient!,
      isCalling: true,
      activeConversationId: conversation.id,
      callType: type,
    };

  const videoCallUser = async () => {
    if (!recipient) return console.log("Recipient undefined");
    socket.emit("onVideoCallInitiate", {
      conversationId: conversation!.id,
      recipientId: recipient.id,
    });
    const constraints = { video: true, audio: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const payload = buildCallPayloadParams(stream, "video");
    if (!payload) throw new Error("Video Call Payload is undefined.");
    dispatch(initiateCallState(payload));
  };

  const voiceCallUser = async () => {
    if (!recipient) return console.log("Recipient undefined");
    socket.emit(SenderEvents.VOICE_CALL_INITIATE, {
      conversationId: conversation!.id,
      recipientId: recipient.id,
    });
    const constraints = { video: false, audio: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const payload = buildCallPayloadParams(stream, "audio");
    if (!payload) throw new Error("Voice Call Payload is undefined.");
    dispatch(initiateCallState(payload));
  };

  return (
    <MessagePanelHeaderStyle>
      <div className={styles.messagePanelHeader}>
        <UserAvatar user={recipient!} />
        {`${recipient?.lastName} ${recipient?.firstName}` || "User"}
      </div>
      <MessagePanelHeaderIcons>
        <FiPhone size={20} cursor="pointer" onClick={voiceCallUser} />
        <FiVideo size={24} cursor="pointer" onClick={videoCallUser} />
        <FiSearch size={24} cursor="pointer" onClick={() => {}} />
      </MessagePanelHeaderIcons>
    </MessagePanelHeaderStyle>
  );
};
