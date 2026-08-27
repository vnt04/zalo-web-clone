import { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { UserSidebar } from '../components/sidebars/UserSidebar';
import { AppDispatch, RootState } from '../store';
import { removeFriendRequest } from '../store/friends/friendsSlice';
import { SocketContext } from '../utils/context/SocketContext';
import { useToast } from '../utils/hooks/useToast';
import {
  AcceptFriendRequestResponse,
  FriendRequest,
  MessageEventPayload,
} from '../utils/types';
import {
  incrementUnreadCount,
  markConversationReadThunk,
  updateConversation,
} from '../store/conversationSlice';
import { addMessage } from '../store/messages/messageSlice';
import { BsFillPersonCheckFill } from 'react-icons/bs';
import { fetchFriendRequestThunk } from '../store/friends/friendsThunk';
import styles from './index.module.scss';
import { AuthContext } from '../utils/context/AuthContext';
import {
  setCall,
  setLocalStream,
  setPeer,
  setRemoteStream,
} from '../store/call/callSlice';
import { CallReceiveDialog } from '../components/calls/CallReceiveDialog';
import { useVideoCallRejected } from '../utils/hooks/sockets/useVideoCallRejected';
import { useVideoCallHangUp } from '../utils/hooks/sockets/useVideoCallHangUp';
import { useVideoCallAccept } from '../utils/hooks/sockets/useVideoCallAccept';
import { useFriendRequestReceived } from '../utils/hooks/sockets/friend-requests/useFriendRequestReceived';
import { useVideoCall } from '../utils/hooks/sockets/call/useVideoCall';
import { useVoiceCall } from '../utils/hooks/sockets/call/useVoiceCall';
import { useVoiceCallAccepted } from '../utils/hooks/sockets/call/useVoiceCallAccepted';
import { useVoiceCallHangUp } from '../utils/hooks/sockets/call/useVoiceCallHangUp';
import { useVoiceCallRejected } from '../utils/hooks/sockets/call/useVoiceCallRejected';

export const AppPage = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { peer, call, isReceivingCall, caller, callType } = useSelector(
    (state: RootState) => state.call
  );
  const { info } = useToast({ theme: 'dark' });
  const { theme } = useSelector((state: RootState) => state.settings);

  // Chế độ tối đổi bảng --zl-* bằng thuộc tính trên <html>, xem src/index.css.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Người dùng quay lại với cookie còn hạn không đi qua form đăng nhập, nên
  // chỗ này lo phần connect cho luồng đó.
  useEffect(() => {
    if (!socket.connected) socket.connect();
  }, [socket]);

  // Listener sống suốt phiên. Đặt ở ConversationPage thì rời sang tab khác là
  // mất tin nhắn đến và không cộng số chưa đọc.
  useEffect(() => {
    const handleMessage = (payload: MessageEventPayload) => {
      const { conversation, message } = payload;
      dispatch(addMessage(payload));
      dispatch(updateConversation(conversation));
      const openId = location.pathname.startsWith('/conversations/')
        ? parseInt(location.pathname.split('/')[2])
        : undefined;
      if (openId === conversation.id)
        dispatch(markConversationReadThunk(conversation.id));
      else if (message.author?.id !== user?.id)
        dispatch(incrementUnreadCount(conversation.id));
    };

    socket.on('onMessage', handleMessage);
    return () => {
      socket.off('onMessage', handleMessage);
    };
  }, [socket, dispatch, location.pathname, user?.id]);

  useEffect(() => {
    dispatch(fetchFriendRequestThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    // peerjs kéo theo webrtc-adapter và các shim, ~142 kB chỉ phục vụ tính năng
    // gọi. Nạp động để nó không nằm trong bundle khởi động.
    let cancelled = false;
    import('peerjs').then(({ default: Peer }) => {
      const newPeer = new Peer(user.peer.id, {
        config: {
          iceServers: [
            {
              url: 'stun:stun.l.google.com:19302',
            },
            {
              url: 'stun:stun1.l.google.com:19302',
            },
          ],
        },
      });
      // Rời trang trước khi import xong thì phải huỷ, không sẽ bỏ lại một kết
      // nối peer không ai tham chiếu.
      if (cancelled) return newPeer.destroy();
      dispatch(setPeer(newPeer));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useFriendRequestReceived();
  useVideoCall();

  useEffect(() => {
    socket.on('onFriendRequestCancelled', (payload: FriendRequest) => {
      dispatch(removeFriendRequest(payload));
    });
    socket.on(
      'onFriendRequestAccepted',
      (payload: AcceptFriendRequestResponse) => {
        dispatch(removeFriendRequest(payload.friendRequest));
        socket.emit('getOnlineFriends');
        info(
          `${payload.friendRequest.receiver.firstName} accepted your friend request`,
          {
            position: 'bottom-left',
            icon: BsFillPersonCheckFill,
            onClick: () => navigate('/friends'),
          }
        );
      }
    );

    socket.on('onFriendRequestRejected', (payload: FriendRequest) => {
      dispatch(removeFriendRequest(payload));
    });

    return () => {
      socket.off('onFriendRequestCancelled');
      socket.off('onFriendRequestRejected');
      socket.off('onFriendRequestReceived');
      socket.off('onFriendRequestAccepted');
    };
  }, [socket, isReceivingCall]);

  /**
   * This useEffect hook is for the user who is receiving the call.
   * So we must dispatch the appropriate actions to set the state
   * for the user receiving the call.
   *
   * The user who is calling will have its own instance of MediaConnection/Call
   */
  useEffect(() => {
    if (!peer) return;
    peer.on('call', async (incomingCall) => {
      const constraints = { video: callType === 'video', audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      incomingCall.answer(stream);
      dispatch(setLocalStream(stream));
      dispatch(setCall(incomingCall));
    });
    return () => {
      peer.off('call');
    };
  }, [peer, callType, dispatch]);

  useEffect(() => {
    if (!call) return;
    call.on('stream', (remoteStream) =>
      dispatch(setRemoteStream(remoteStream))
    );
    return () => {
      call.off('stream');
    };
  }, [call]);

  useVideoCallAccept();
  useVideoCallRejected();
  useVideoCallHangUp();
  useVoiceCall();
  useVoiceCallAccepted();
  useVoiceCallHangUp();
  useVoiceCallRejected();

  return (
    <>
      {isReceivingCall && caller && <CallReceiveDialog />}
      <div className={styles.layout}>
        <UserSidebar />
        <Outlet />
      </div>
    </>
  );
};
