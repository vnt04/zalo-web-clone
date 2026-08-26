import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConversationNotFoundException } from '../../conversations/exceptions/ConversationNotFound';
import { Services } from '../../utils/constants';
import { Message } from '../../utils/typeorm';
import { mockRepository } from '../../__mocks__';
import { MessageService } from '../message.service';

describe('MessageService', () => {
  let service: MessageService;
  let messageRepository: ReturnType<typeof mockRepository>;
  let conversationsService: { hasAccess: jest.Mock };

  beforeEach(async () => {
    messageRepository = mockRepository();
    conversationsService = { hasAccess: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: getRepositoryToken(Message), useValue: messageRepository },
        { provide: Services.CONVERSATIONS, useValue: conversationsService },
        { provide: Services.MESSAGE_ATTACHMENTS, useValue: {} },
        { provide: Services.FRIENDS_SERVICE, useValue: {} },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMessages', () => {
    /**
     * Chặn hồi quy lỗ hổng: getMessages từng chỉ nhận conversationId, nên bất
     * kỳ ai cũng đọc được hội thoại của người khác bằng cách đổi id trên URL.
     */
    it('throws and reads nothing when the user is not a participant', async () => {
      conversationsService.hasAccess.mockResolvedValue(false);

      await expect(service.getMessages({ id: 1, userId: 99 })).rejects.toThrow(
        ConversationNotFoundException,
      );
      expect(messageRepository.find).not.toHaveBeenCalled();
    });

    it('returns the conversation messages for a participant', async () => {
      conversationsService.hasAccess.mockResolvedValue(true);
      messageRepository.find.mockResolvedValue([]);

      await service.getMessages({ id: 1, userId: 2 });

      expect(conversationsService.hasAccess).toHaveBeenCalledWith({
        id: 1,
        userId: 2,
      });
      expect(messageRepository.find).toHaveBeenCalled();
    });
  });
});
