import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';
import {
  ConversationMessage,
  DeleteMessageResponse,
  MessageEventPayload,
  MessageType,
} from '../../utils/types';
import {
  deleteMessageThunk,
  editMessageThunk,
  fetchMessagesThunk,
  fetchMoreMessagesThunk,
} from './messageThunk';

export interface MessagesState {
  messages: ConversationMessage[];
  loading: boolean;
  loadingMore: boolean;
  // id các hội thoại đã tải hết lịch sử — để thôi hỏi thêm khi cuộn.
  exhausted: number[];
}

const initialState: MessagesState = {
  messages: [],
  loading: false,
  loadingMore: false,
  exhausted: [],
};

export const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<MessageEventPayload>) => {
      console.log(state);
      console.log(action);
      const { conversation, message } = action.payload;
      const conversationMessage = state.messages.find((cm) => cm.id === conversation.id);
      conversationMessage?.messages.unshift(message);
    },
    deleteMessage: (state, action: PayloadAction<DeleteMessageResponse>) => {
      const { payload } = action;
      const conversationMessages = state.messages.find((cm) => cm.id === payload.conversationId);
      if (!conversationMessages) return;
      const messageIndex = conversationMessages.messages.findIndex(
        (m) => m.id === payload.messageId
      );
      // Không tìm thấy thì splice(-1, 1) sẽ xoá nhầm tin nhắn cuối.
      if (messageIndex === -1) return;
      conversationMessages.messages.splice(messageIndex, 1);
    },
    editMessage: (state, action: PayloadAction<MessageType>) => {
      const message = action.payload;
      const conversationMessage = state.messages.find((cm) => cm.id === message.conversation.id);
      if (!conversationMessage) return;
      const messageIndex = conversationMessage.messages.findIndex((m) => m.id === message.id);
      if (messageIndex === -1) return;
      conversationMessage.messages[messageIndex] = message;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        const { id } = action.payload.data;
        // Tải lại từ đầu thì lịch sử cũ hết hiệu lực, cho phép cuộn hỏi lại.
        state.exhausted = state.exhausted.filter((cid) => cid !== id);
        const index = state.messages.findIndex((cm) => cm.id === id);
        if (index === -1) {
          state.messages.push(action.payload.data);
          return;
        }
        state.messages[index] = action.payload.data;
      })
      .addCase(deleteMessageThunk.fulfilled, (state, action) => {
        const { data } = action.payload;
        const conversationMessages = state.messages.find((cm) => cm.id === data.conversationId);
        if (!conversationMessages) return;
        const messageIndex = conversationMessages.messages.findIndex(
          (m) => m.id === data.messageId
        );
        if (messageIndex === -1) return;
        conversationMessages.messages.splice(messageIndex, 1);
      })
      .addCase(editMessageThunk.fulfilled, (state, action) => {
        const { data: message } = action.payload;
        const { id } = message.conversation;
        const conversationMessage = state.messages.find((cm) => cm.id === id);
        if (!conversationMessage) return;
        const messageIndex = conversationMessage.messages.findIndex((m) => m.id === message.id);
        if (messageIndex === -1) return;
        conversationMessage.messages[messageIndex] = message;
      })
      .addCase(fetchMoreMessagesThunk.pending, (state) => {
        state.loadingMore = true;
      })
      .addCase(fetchMoreMessagesThunk.rejected, (state) => {
        state.loadingMore = false;
      })
      .addCase(fetchMoreMessagesThunk.fulfilled, (state, action) => {
        state.loadingMore = false;
        const { id, messages } = action.payload.data;
        // Trang rỗng nghĩa là đã chạm đáy lịch sử.
        if (!messages.length) {
          if (!state.exhausted.includes(id)) state.exhausted.push(id);
          return;
        }
        const conversationMessage = state.messages.find((cm) => cm.id === id);
        if (!conversationMessage) return;
        // Mảng xếp mới nhất trước, nên tin cũ hơn nối vào cuối.
        conversationMessage.messages.push(...messages);
      });
  },
});

const selectConversationMessages = (state: RootState) => state.messages.messages;

const selectConversationMessageId = (_state: RootState, id: number) => id;

export const selectConversationMessage = createSelector(
  [selectConversationMessages, selectConversationMessageId],
  (conversationMessages, id) => conversationMessages.find((cm) => cm.id === id)
);

export const { addMessage, deleteMessage, editMessage } = messagesSlice.actions;

export default messagesSlice.reducer;
