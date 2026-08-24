import { HttpException, HttpStatus } from '@nestjs/common';

export class CaptchaInvalidException extends HttpException {
  constructor() {
    super('Invalid captcha', HttpStatus.BAD_REQUEST);
  }
}
