import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../auth/utils/Guards';
import { Routes, Services } from '../../utils/constants';
import { UserAlreadyExists } from '../exceptions/UserAlreadyExists';
import { IUserService } from '../interfaces/user';

@Controller(Routes.USERS)
@UseGuards(AuthenticatedGuard)
export class UsersController {
  constructor(
    @Inject(Services.USERS) private readonly userService: IUserService,
  ) {}

  @Get('search')
  searchUsers(@Query('query') query: string) {
    console.log(query);
    if (!query)
      throw new HttpException('Provide a valid query', HttpStatus.BAD_REQUEST);
    return this.userService.searchUserByPhoneNumber(query);
  }

  @Get('check')
  async checkPhoneNumber(@Query('phoneNumber') phoneNumber: string) {
    if (!phoneNumber)
      throw new HttpException('Invalid Query', HttpStatus.BAD_REQUEST);
    const user = await this.userService.findUser({ phoneNumber });
    if (user) throw new UserAlreadyExists();
    return HttpStatus.OK;
  }
}
