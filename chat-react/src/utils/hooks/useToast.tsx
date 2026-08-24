import { toast, ToastOptions } from 'react-toastify';

// Toast Zalo là viên thuốc chỉ có chữ: không icon, không nút đóng, không thanh
// tiến trình. Kiểu dáng nằm ở src/utils/styles/toast.scss.
const ZALO_TOAST: ToastOptions<{}> = {
  theme: 'dark',
  icon: false,
  closeButton: false,
  hideProgressBar: true,
  autoClose: 2500,
};

// defaultOptions của nơi gọi được merge lên trên ZALO_TOAST, không thay thế nó,
// để mọi toast trong app giữ chung một kiểu dáng.
export function useToast(defaultOptions: ToastOptions<{}> = {}) {
  const options = { ...ZALO_TOAST, ...defaultOptions };

  const success = (data: string) => toast(data, { ...options, type: 'success' });

  const error = (data: string, overrides?: ToastOptions<{}>) =>
    toast(data, { ...options, ...overrides, type: 'error' });

  const info = (data: string, overrides?: ToastOptions<{}>) =>
    toast(data, { ...options, ...overrides, type: 'info' });

  return { success, error, info };
}
