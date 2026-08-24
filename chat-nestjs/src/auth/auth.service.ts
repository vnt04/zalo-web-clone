import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IUserService } from '../users/interfaces/user';
import { Services } from '../utils/constants';
import { compareHash } from '../utils/helpers';
import { normalizePhone } from '../utils/phone';
import { ValidateUserDetails } from '../utils/types';
import { IAuthService } from './auth';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(Services.USERS) private readonly userService: IUserService,
  ) {}

  async validateUser(userDetails: ValidateUserDetails) {
    // SĐT sai định dạng trả cùng lỗi với sai mật khẩu — không tiết lộ số nào tồn tại.
    const phoneNumber = normalizePhone(userDetails.phoneNumber);
    if (!phoneNumber)
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
    const user = await this.userService.findUser(
      { phoneNumber },
      { selectAll: true },
    );
    if (!user)
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
    const isPasswordValid = await compareHash(
      userDetails.password,
      user.password,
    );
    return isPasswordValid ? user : null;
  }
}
