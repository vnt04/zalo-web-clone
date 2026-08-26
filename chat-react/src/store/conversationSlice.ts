import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  Conversation,
  CreateConversationParams,
  UpdateConversationStateParams,
} from '../utils/types';
import {
  getConversations,
  patchConversationState,
  postConversationRead,
  postNewConversation,
} from '../utils/api';
import { RootState } from '.';

export interface ConversationsState {
  conversations: Conversation[];
  loading: boolean;
}

const initialState: ConversationsState = {
  conversations: [],
  loading: false,
};

// Hội thoại ghim luôn nằm trên, phần còn lại giữ nguyên thứ tự sẵn có (backend
// đã sắp theo lastMessageSentAt, socket thì unshift lên đầu).
const pinnedFirst = (conversations: Conversation[]) => [
  ...conversations.filter((c) => c.isPinned),
  ...conversations.filter((c) => !c.isPinned),
];

export const fetchConversationsThunk = createAsyncThunk('conversations/fetch', async () => {
  return getConversations();
});

export const createConversationThunk = createAsyncThunk(
  'conversations/create',
  async (data: CreateConversationParams) => {
    return postNewConversation(data);
  }
);

export const markConversationReadThunk = createAsyncThunk(
  'conversations/markRead',
  async (id: number) => {
    return postConversationRead(id);
  }
);

export const updateConversationStateThunk = createAsyncThunk(
  'conversations/updateState',
  async (params: UpdateConversationStateParams) => {
    return patchConversationState(params);
  }
);

export const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    addConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.unshift(action.payload);
      state.conversations = pinnedFirst(state.conversations);
    },
    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const conversation = action.payload;
      const index = state.conversations.findIndex((c) => c.id === conversation.id);
      const current = index === -1 ? undefined : state.conversations[index];
      if (index !== -1) state.conversations.splice(index, 1);
      // Payload đến từ socket nên không mang trạng thái riêng của người dùng —
      // giữ lại giá trị đang có thay vì để mất khi có tin mới.
      state.conversations.unshift({
        ...conversation,
        unreadCount: current?.unreadCount ?? 0,
        isPinned: current?.isPinned ?? false,
        isMuted: current?.isMuted ?? false,
      });
      state.conversations = pinnedFirst(state.conversations);
    },
    incrementUnreadCount: (state, action: PayloadAction<number>) => {
      const conversation = state.conversations.find((c) => c.id === action.payload);
      if (conversation) conversation.unreadCount = (conversation.unreadCount ?? 0) + 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversationsThunk.fulfilled, (state, action) => {
        state.conversations = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchConversationsThunk.pending, (state, _action) => {
        state.loading = true;
      })
      .addCase(createConversationThunk.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload.data);
        state.conversations = pinnedFirst(state.conversations);
      })
      .addCase(markConversationReadThunk.fulfilled, (state, action) => {
        const conversation = state.conversations.find(
          (c) => c.id === action.payload.data.conversationId
        );
        if (conversation) conversation.unreadCount = 0;
      })
      .addCase(updateConversationStateThunk.fulfilled, (state, action) => {
        const { conversationId, isPinned, isMuted } = action.payload.data;
        const conversation = state.conversations.find((c) => c.id === conversationId);
        if (!conversation) return;
        conversation.isPinned = isPinned;
        conversation.isMuted = isMuted;
        state.conversations = pinnedFirst(state.conversations);
      });
  },
});

const selectConversations = (state: RootState) => state.conversation.conversations;
const selectConversationId = (_state: RootState, id: number) => id;

export const selectConversationById = createSelector(
  [selectConversations, selectConversationId],
  (conversations, conversationId) => conversations.find((c) => c.id === conversationId)
);

// Action creators are generated for each case reducer function
export const { addConversation, updateConversation, incrementUnreadCount } =
  conversationsSlice.actions;

export default conversationsSlice.reducer;
