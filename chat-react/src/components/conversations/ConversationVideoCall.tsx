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
import styles from '../calls/index.module.scss';

export const ConversationVideoCall = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socket = useContext(SocketContext);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const { localStream, remoteStream, caller, receiver } = useSelector(
    (state: RootState) => state.call
  );
  useEffect(() => {
    console.log('local stream was updated...');
    console.log(localStream);
    if (localVideoRef.current && localStream) {
      console.log('updating local video ref');
      console.log(`Updating local stream ${localStream.id}`);
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.muted = true;
    }
  }, [localStream]);
  useEffect(() => {
    console.log('remote stream was updated...');
    console.log(remoteStream);
    if (remoteVideoRef.current && remoteStream) {
      console.log('updating remote video ref');
      console.log(`Updating remote stream ${remoteStream.id}`);
      remoteVideoRef.current.srcObject = remoteStream;
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
    socket.emit('videoCallHangUp', { caller, receiver });
  };

  return (
    <div className={styles.callStage}>
      <div className={styles.mediaArea}>
        {localStream && <video ref={localVideoRef} playsInline autoPlay />}
        {remoteStream && <video ref={remoteVideoRef} playsInline autoPlay />}
      </div>
      <div className={styles.controlBar}>
        <button
          type="button"
          className={styles.controlButton}
          title={videoEnabled ? 'Tắt camera' : 'Bật camera'}
          onClick={toggleVideo}
        >
          {videoEnabled ? <BiVideo size={22} /> : <BiVideoOff size={22} />}
        </button>
        <button
          type="button"
          className={styles.controlButton}
          title={microphoneEnabled ? 'Tắt micro' : 'Bật micro'}
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
