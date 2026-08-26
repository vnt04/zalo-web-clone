import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Services } from '../../utils/constants';
import { Conversation, Message } from '../../utils/typeorm';
import { mockRepository } from '../../__mocks__';
import { ConversationsService } from '../conversations.service';

describe('ConversationsService', () => {
  let service: ConversationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: getRepositoryToken(Conversation),
          useValue: mockRepository(),
        },
        { provide: getRepositoryToken(Message), useValue: mockRepository() },
        { provide: Services.USERS, useValue: {} },
        { provide: Services.FRIENDS_SERVICE, useValue: {} },
        { provide: Services.CONVERSATION_STATES, useValue: {} },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
