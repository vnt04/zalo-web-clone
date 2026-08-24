import { normalizePhone } from './phone';

describe('normalizePhone', () => {
  it('thêm mã quốc gia khi số bắt đầu bằng 0', () => {
    expect(normalizePhone('0912345678')).toBe('84912345678');
  });

  it('giữ nguyên khi đã có mã quốc gia', () => {
    expect(normalizePhone('84912345678')).toBe('84912345678');
  });

  it('chấp nhận số không có tiền tố', () => {
    expect(normalizePhone('912345678')).toBe('84912345678');
  });

  it('bỏ qua dấu cộng, khoảng trắng và dấu chấm', () => {
    expect(normalizePhone('+84 912.345.678')).toBe('84912345678');
  });

  it('chấp nhận mọi đầu số di động Việt Nam', () => {
    expect(normalizePhone('0312345678')).toBe('84312345678');
    expect(normalizePhone('0512345678')).toBe('84512345678');
    expect(normalizePhone('0712345678')).toBe('84712345678');
    expect(normalizePhone('0812345678')).toBe('84812345678');
  });

  it('trả null với đầu số không hợp lệ', () => {
    expect(normalizePhone('0112345678')).toBeNull();
  });

  it('trả null khi sai độ dài', () => {
    expect(normalizePhone('091234567')).toBeNull();
    expect(normalizePhone('09123456789')).toBeNull();
  });

  it('trả null với chuỗi rác hoặc rỗng', () => {
    expect(normalizePhone('abc')).toBeNull();
    expect(normalizePhone('')).toBeNull();
  });
});
