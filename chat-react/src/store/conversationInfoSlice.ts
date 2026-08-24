import { createSlice } from '@reduxjs/toolkit';

export interface ConversationInfoState {
  showInfoPanel: boolean;
}

// Zalo mở sẵn panel thông tin ở lần đầu vào hội thoại.
const initialState: ConversationInfoState = {
  showInfoPanel: true,
};

export const conversationInfoSlice = createSlice({
  name: 'conversationInfo',
  initialState,
  reducers: {
    toggleInfoPanel: (state) => {
      state.showInfoPanel = !state.showInfoPanel;
    },
  },
});

export const { toggleInfoPanel } = conversationInfoSlice.actions;

export default conversationInfoSlice.reducer;
