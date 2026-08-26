import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useParams } from "react-router-dom";
import { ConversationPanel } from "../../components/conversations/ConversationPanel";
import { ConversationSidebar } from "../../components/sidebars/ConversationSidebar";
import { AppDispatch } from "../../store";
import {
  addConversation,
  fetchConversationsThunk,
} from "../../store/conversationSlice";
import { deleteMessage } from "../../store/messages/messageSlice";
import { updateType } from "../../store/selectedSlice";
import { SocketContext } from "../../utils/context/SocketContext";
import { Conversation } from "../../utils/types";

export const ConversationPage = () => {
  const { id } = useParams();
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 800);
  const dispatch = useDispatch<AppDispatch>();
  const socket = useContext(SocketContext);

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

  // onMessage đã chuyển lên AppPage để sống suốt phiên.
  useEffect(() => {
    socket.on("onConversation", (payload: Conversation) => {
      dispatch(addConversation(payload));
    });
    socket.on("onMessageDelete", (payload) => {
      dispatch(deleteMessage(payload));
    });
    return () => {
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
