import 'express-session';

declare module 'express-session' {
  interface SessionData {
    captcha?: string;
    captchaExpires?: number;
  }
}
