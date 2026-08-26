import { useContext } from "react";
import { MdCall, MdCallEnd } from "react-icons/md";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { SenderEvents, WebsocketEvents } from "../../utils/constants";
import { SocketContext } from "../../utils/context/SocketContext";
import { HandleCallType } from "../../utils/types";
import defaultAvatar from "../../__assets__/default_avatar.jpg";
import styles from "./index.module.scss";

export const CallReceiveDialog = () => {
  const { caller, callType } = useSelector((state: RootState) => state.call);
  const socket = useContext(SocketContext);

  const handleCall = (type: HandleCallType) => {
    const payload = { caller };
    const isVideo = callType === "video";
    if (type === "accept") {
      return isVideo
        ? socket.emit("videoCallAccepted", payload)
        : socket.emit(SenderEvents.VOICE_CALL_ACCEPT, payload);
    }
    return isVideo
      ? socket.emit(WebsocketEvents.VIDEO_CALL_REJECTED, payload)
      : socket.emit(WebsocketEvents.VOICE_CALL_REJECTED, payload);
  };

  return (
    <div className={styles.receiveDialog} role="dialog" aria-label="Cuộc gọi đến">
      <img
        className={styles.receiveAvatar}
        src={caller?.profile?.avatar ?? defaultAvatar}
        alt=""
      />
      <div className={styles.receiveText}>
        <span className={styles.receiveName}>
          {caller ? `${caller.firstName} ${caller.lastName}` : "Người lạ"}
        </span>
        <span className={styles.receiveSubtitle}>
          {callType === "video" ? "Cuộc gọi video đến" : "Cuộc gọi thoại đến"}
        </span>
      </div>
      <div className={styles.receiveActions}>
        <button
          type="button"
          className={styles.acceptCall}
          title="Trả lời"
          onClick={() => handleCall("accept")}
        >
          <MdCall size={20} />
        </button>
        <button
          type="button"
          className={styles.rejectCall}
          title="Từ chối"
          onClick={() => handleCall("reject")}
        >
          <MdCallEnd size={20} />
        </button>
      </div>
    </div>
  );
};
