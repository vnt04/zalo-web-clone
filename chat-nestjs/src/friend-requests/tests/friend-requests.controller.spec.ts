import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { Services } from '../../utils/constants';
import { mockUser } from '../../__mocks__';
import { IFriendRequestService } from '../friend-requests';
import { FriendRequestController } from '../friend-requests.controller';

describe('FriendRequestsController', () => {
  let controller: FriendRequestController;
  let friendRequestService: IFriendRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendRequestController],
      providers: [
        {
          provide: Services.FRIENDS_REQUESTS_SERVICE,
          useValue: {
            getFriendRequests: jest.fn((x) => x),
            create: jest.fn((x) => x),
          },
        },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    controller = module.get<FriendRequestController>(FriendRequestController);
    friendRequestService = module.get<IFriendRequestService>(
      Services.FRIENDS_REQUESTS_SERVICE,
    );
    jest.clearAllMocks();
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
    expect(friendRequestService).toBeDefined();
  });

  it('should call friendRequestService.getFriendRequests', async () => {
    await controller.getFriendRequests(mockUser);
    expect(friendRequestService.getFriendRequests).toHaveBeenCalledWith(
      mockUser.id,
    );
  });

  // Kết bạn tra theo số điện thoại, không phải email — CreateFriendDto chỉ có
  // phoneNumber. Spec cũ còn truyền email từ thời trước khi đổi.
  it('should call createFriendRequest with correct params', async () => {
    await controller.createFriendRequest(mockUser, {
      phoneNumber: '0900000001',
    });
    expect(friendRequestService.create).toHaveBeenCalledWith({
      user: mockUser,
      phoneNumber: '0900000001',
    });
  });
});
