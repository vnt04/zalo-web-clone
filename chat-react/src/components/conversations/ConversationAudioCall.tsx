import { useEffect, useRef, useState, useContext } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import classNames from 'classnames';
import {
  BiMicrophone,
  BiMicrophoneOff,
  BiVideo,
  BiVideoOff,
} from 'react-icons/bi';
import { ImPhoneHangUp } from 'react-icons/im';
import { SocketContext } from '../../utils/context/SocketContext';
import { WebsocketEvents } from '../../utils/constants';
import styles from '../calls/index.module.scss';

export const ConversationAudioCall = () => {
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const socket = useContext(SocketContext);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const { localStream, remoteStream, caller, receiver } = useSelector(
    (state: RootState) => state.call
  );
  useEffect(() => {
    if (localAudioRef.current && localStream) {
      localAudioRef.current.srcObject = localStream;
      localAudioRef.current.muted = true;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMicrophone = () =>
    localStream &&
    setMicrophoneEnabled((prev) => {
      localStream.getAudioTracks()[0].enabled = !prev;
      return !prev;
    });

  const toggleVideo = () =>
    localStream &&
    setVideoEnabled((prev) => {
      localStream.getVideoTracks()[0].enabled = !prev;
      return !prev;
    });

  const closeCall = () => {
    socket.emit(WebsocketEvents.VOICE_CALL_HANG_UP, { caller, receiver });
  };

  return (
    <div className={styles.callStage}>
      <div className={styles.mediaArea}>
        {localStream && <audio ref={localAudioRef} autoPlay controls />}
        {remoteStream && <audio ref={remoteAudioRef} autoPlay controls />}
      </div>
      <div className={styles.controlBar}>
        <button
          type="button"
          className={styles.controlButton}
          title={videoEnabled ? "Tắt camera" : "Bật camera"}
          onClick={toggleVideo}
        >
          {videoEnabled ? <BiVideo size={22} /> : <BiVideoOff size={22} />}
        </button>
        <button
          type="button"
          className={styles.controlButton}
          title={microphoneEnabled ? "Tắt micro" : "Bật micro"}
          onClick={toggleMicrophone}
        >
          {microphoneEnabled ? (
            <BiMicrophone size={22} />
          ) : (
            <BiMicrophoneOff size={22} />
          )}
        </button>
        <button
          type="button"
          className={classNames(styles.controlButton, styles.hangUpButton)}
          title="Kết thúc"
          onClick={closeCall}
        >
          <ImPhoneHangUp size={20} />
        </button>
      </div>
    </div>
  );
};
