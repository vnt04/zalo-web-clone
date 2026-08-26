import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SelectableTheme } from '../../utils/types';

export interface SettingsState {
  theme: SelectableTheme;
}

// Đọc lại từ localStorage ngay lúc khởi tạo: AppPage ưu tiên giá trị trong
// localStorage, nếu store không đồng bộ thì màn Giao diện sẽ tô sai mục đang chọn.
const storedTheme = localStorage.getItem('theme') as SelectableTheme | null;

const initialState: SettingsState = {
  theme: storedTheme ?? 'light',
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<SelectableTheme>) => {
      state.theme = action.payload;
    },
  },
});

export const { setTheme } = settingsSlice.actions;

export default settingsSlice.reducer;
