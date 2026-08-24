import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useParams } from "react-router-dom";
import { ConversationPanel } from "../../components/conversations/ConversationPanel";
import { ConversationSidebar } from "../../components/sidebars/ConversationSidebar";
import { AppDispatch } from "../../store";
import {
  addConversation,
  fetchConversationsThunk,
  incrementUnreadCount,
  markConversationReadThunk,
  updateConversation,
} from "../../store/conversationSlice";
import { addMessage, deleteMessage } from "../../store/messages/messageSlice";
import { updateType } from "../../store/selectedSlice";
import { AuthContext } from "../../utils/context/AuthContext";
import { SocketContext } from "../../utils/context/SocketContext";
import { Conversation, MessageEventPayload } from "../../utils/types";

export const ConversationPage = () => {
  const { id } = useParams();
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 800);
  const dispatch = useDispatch<AppDispatch>();
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const handleResize = () => setShowSidebar(window.innerWidth > 800);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    dispatch(updateType("private"));
    dispatch(fetchConversationsThunk());
  }, []);

  useEffect(() => {
    socket.on("onMessage", (payload: MessageEventPayload) => {
      console.log("Message Received");
      const { conversation, message } = payload;
      console.log(conversation, message);
      dispatch(addMessage(payload));
      dispatch(updateConversation(conversation));
      // Đang mở hội thoại thì coi như đọc luôn, ngược lại cộng vào số chưa đọc.
      if (parseInt(id!) === conversation.id)
        dispatch(markConversationReadThunk(conversation.id));
      else if (message.author?.id !== user?.id)
        dispatch(incrementUnreadCount(conversation.id));
    });
    socket.on("onConversation", (payload: Conversation) => {
      console.log("Received onConversation Event");
      console.log(payload);
      dispatch(addConversation(payload));
    });
    socket.on("onMessageDelete", (payload) => {
      console.log("Message Deleted");
      console.log(payload);
      dispatch(deleteMessage(payload));
    });
    return () => {
      socket.off("connected");
      socket.off("onMessage");
      socket.off("onConversation");
      socket.off("onMessageDelete");
    };
  }, [id]);

  return (
    <>
      {showSidebar && <ConversationSidebar />}
      {!id && !showSidebar && <ConversationSidebar />}
      {!id && showSidebar && <ConversationPanel />}
      <Outlet />
    </>
  );
};
