import { Test, TestingModule } from '@nestjs/testing';
import { Services } from '../../utils/constants';
import { AuthController } from '../auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: Services.AUTH, useValue: {} },
        { provide: Services.USERS, useValue: {} },
        { provide: Services.CAPTCHA, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
