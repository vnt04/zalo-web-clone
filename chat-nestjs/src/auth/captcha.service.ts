import { Injectable } from '@nestjs/common';
import { SessionData } from 'express-session';
import * as svgCaptcha from 'svg-captcha';
import { CaptchaInvalidException } from './exceptions/CaptchaInvalid';

const TTL_MS = 5 * 60 * 1000;

@Injectable()
export class CaptchaService {
  generate(session: SessionData): { svg: string } {
    const { data, text } = svgCaptcha.create({
      size: 5,
      noise: 2,
      ignoreChars: '0o1il',
      color: true,
      background: '#f5f5f5',
    });
    session.captcha = text.toLowerCase();
    session.captchaExpires = Date.now() + TTL_MS;
    return { svg: data };
  }

  verify(session: SessionData, answer: string): void {
    const expected = session.captcha;
    const expires = session.captchaExpires ?? 0;
    // Dùng một lần: xoá trước khi so sánh để lần thử sau luôn phải lấy mã mới.
    session.captcha = undefined;
    session.captchaExpires = undefined;
    if (!expected || Date.now() > expires) throw new CaptchaInvalidException();
    if (!answer || answer.toLowerCase() !== expected)
      throw new CaptchaInvalidException();
  }
}
