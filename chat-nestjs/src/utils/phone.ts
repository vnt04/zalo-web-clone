// Đầu số di động Việt Nam sau khi đã bỏ tiền tố quốc gia hoặc số 0.
const VN_MOBILE = /^[35789]\d{8}$/;

/**
 * Chuẩn hoá số điện thoại về dạng 84xxxxxxxxx.
 * Đây là nguồn chân lý duy nhất — frontend chỉ validate để báo lỗi sớm.
 */
export function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  let national: string;
  if (digits.startsWith('84')) national = digits.slice(2);
  else if (digits.startsWith('0')) national = digits.slice(1);
  else national = digits;
  return VN_MOBILE.test(national) ? `84${national}` : null;
}
