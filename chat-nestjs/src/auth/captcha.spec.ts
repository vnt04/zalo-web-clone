import { SessionData } from 'express-session';
import { CaptchaService } from './captcha.service';
import { CaptchaInvalidException } from './exceptions/CaptchaInvalid';

describe('CaptchaService', () => {
  let service: CaptchaService;
  let session: SessionData;

  beforeEach(() => {
    service = new CaptchaService();
    session = {} as SessionData;
  });

  it('sinh SVG và lưu đáp án vào session', () => {
    const { svg } = service.generate(session);
    expect(svg).toContain('<svg');
    expect(session.captcha).toBeTruthy();
    expect(session.captchaExpires).toBeGreaterThan(Date.now());
  });

  it('chấp nhận đáp án đúng, không phân biệt hoa thường', () => {
    service.generate(session);
    const answer = session.captcha as string;
    expect(() => service.verify(session, answer.toUpperCase())).not.toThrow();
  });

  it('từ chối đáp án sai', () => {
    service.generate(session);
    expect(() => service.verify(session, 'sai')).toThrow(
      CaptchaInvalidException,
    );
  });

  it('xoá đáp án sau khi dùng — không cho dùng lại', () => {
    service.generate(session);
    const answer = session.captcha as string;
    service.verify(session, answer);
    expect(() => service.verify(session, answer)).toThrow(
      CaptchaInvalidException,
    );
  });

  it('từ chối khi đã hết hạn', () => {
    service.generate(session);
    session.captchaExpires = Date.now() - 1;
    expect(() => service.verify(session, session.captcha as string)).toThrow(
      CaptchaInvalidException,
    );
  });

  it('từ chối khi session chưa có captcha', () => {
    expect(() => service.verify(session, 'bat-ky')).toThrow(
      CaptchaInvalidException,
    );
  });
});
