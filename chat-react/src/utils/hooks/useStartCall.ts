import { useContext } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { initiateCallState } from "../../store/call/callSlice";
import { SenderEvents } from "../constants";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { CallType, User } from "../types";
import { useToast } from "./useToast";

type StartCallParams = {
  conversationId: number;
  recipient: User;
};

/**
 * Một chỗ duy nhất bắt đầu cuộc gọi: xin quyền thiết bị, báo cho phía kia qua
 * socket rồi đẩy state cuộc gọi vào store. Header hội thoại và trang Cuộc gọi
 * dùng chung để hai nơi không lệch nhau.
 */
export function useStartCall() {
  const user = useContext(AuthContext).user!;
  const socket = useContext(SocketContext);
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useToast();

  const startCall = async (
    { conversationId, recipient }: StartCallParams,
    callType: CallType
  ) => {
    const isVideo = callType === "video";
    try {
      socket.emit(
        isVideo ? SenderEvents.VIDEO_CALL_INITIATE : SenderEvents.VOICE_CALL_INITIATE,
        { conversationId, recipientId: recipient.id }
      );
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });
      dispatch(
        initiateCallState({
          localStream,
          caller: user,
          receiver: recipient,
          isCalling: true,
          activeConversationId: conversationId,
          callType,
        })
      );
    } catch {
      error("Không truy cập được micro hoặc camera");
    }
  };

  return {
    startVoiceCall: (params: StartCallParams) => startCall(params, "audio"),
    startVideoCall: (params: StartCallParams) => startCall(params, "video"),
  };
}
