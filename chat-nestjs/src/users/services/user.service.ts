import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from '../../utils/helpers';
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
    const existingUser = await this.userRepository.findOne({
      phoneNumber: userDetails.phoneNumber,
    });
    if (existingUser)
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    const password = await hashPassword(userDetails.password);
    const peer = this.peerRepository.create();
    const params = { ...userDetails, password, peer };
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
    return this.userRepository.findOne(params, {
      select: options?.selectAll ? selectionsWithPassword : selections,
      relations: ['profile', 'presence', 'peer'],
    });
  }

  async saveUser(user: User) {
    return this.userRepository.save(user);
  }

  async searchUserByPhoneNumber(query: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber: query })
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
