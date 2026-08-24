import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from '../../utils/helpers';
import { normalizePhone } from '../../utils/phone';
import { Peer, User } from '../../utils/typeorm';
import {
  CreateUserDetails,
  FindUserOptions,
  FindUserParams,
} from '../../utils/types';
import { IUserService } from '../interfaces/user';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Peer) private readonly peerRepository: Repository<Peer>,
  ) {}

  async createUser(userDetails: CreateUserDetails) {
    const phoneNumber = normalizePhone(userDetails.phoneNumber);
    if (!phoneNumber)
      throw new HttpException('Invalid phone number', HttpStatus.BAD_REQUEST);
    const existingUser = await this.userRepository.findOne({ phoneNumber });
    if (existingUser)
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    const password = await hashPassword(userDetails.password);
    const peer = this.peerRepository.create();
    // phoneNumber đặt sau ...userDetails để ghi đè giá trị thô.
    const params = { ...userDetails, phoneNumber, password, peer };
    const newUser = this.userRepository.create(params);
    return this.userRepository.save(newUser);
  }

  async findUser(
    params: FindUserParams,
    options?: FindUserOptions,
  ): Promise<User> {
    const selections: (keyof User)[] = [
      'email',
      'phoneNumber',
      'firstName',
      'lastName',
      'id',
    ];
    const selectionsWithPassword: (keyof User)[] = [...selections, 'password'];
    // Cột phone_number luôn giữ dạng đã chuẩn hoá, nên mọi tra cứu theo SĐT
    // cũng phải chuẩn hoá — nếu không, người gõ 0912345678 sẽ không ra
    // tài khoản đã lưu 84912345678.
    const criteria = this.normalizePhoneCriteria(params);
    if (!criteria) return null;
    return this.userRepository.findOne(criteria, {
      select: options?.selectAll ? selectionsWithPassword : selections,
      relations: ['profile', 'presence', 'peer'],
    });
  }

  private normalizePhoneCriteria(params: FindUserParams): FindUserParams {
    if (!params.phoneNumber) return params;
    const phoneNumber = normalizePhone(params.phoneNumber);
    return phoneNumber ? { ...params, phoneNumber } : null;
  }

  async saveUser(user: User) {
    return this.userRepository.save(user);
  }

  async searchUserByPhoneNumber(query: string) {
    // Query khớp tuyệt đối, nên phải chuẩn hoá cả lúc tìm chứ không chỉ lúc ghi.
    const phoneNumber = normalizePhone(query);
    if (!phoneNumber) return null;
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber })
      .select([
        'user.phoneNumber',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.id',
        'user.profile',
      ])
      .getOne();

    return user || null;
  }
}
