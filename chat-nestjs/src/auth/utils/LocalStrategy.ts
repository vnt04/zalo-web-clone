import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-local';
import { Services } from '../../utils/constants';
import { IAuthService } from '../auth';
import { CaptchaService } from '../captcha.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(Services.AUTH) private readonly authService: IAuthService,
    @Inject(Services.CAPTCHA) private readonly captchaService: CaptchaService,
  ) {
    super({ usernameField: 'phoneNumber', passReqToCallback: true });
  }

  async validate(req: Request, phoneNumber: string, password: string) {
    // Verify trước khi so mật khẩu — sai captcha thì không tốn một lần bcrypt.
    this.captchaService.verify(req.session, req.body.captcha);
    return this.authService.validateUser({ phoneNumber, password });
  }
}
