import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsModule } from '../friends/friends.module';
import { UsersModule } from '../users/users.module';
import { Services } from '../utils/constants';
import { isAuthorized } from '../utils/helpers';
import {
  Conversation,
  ConversationState,
  Message,
  User,
} from '../utils/typeorm';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationStatesService } from './conversation-states.service';
import { ConversationMiddleware } from './middlewares/conversation.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, ConversationState, Message, User]),
    UsersModule,
    FriendsModule,
  ],
  controllers: [ConversationsController],
  providers: [
    {
      provide: Services.CONVERSATIONS,
      useClass: ConversationsService,
    },
    {
      provide: Services.CONVERSATION_STATES,
      useClass: ConversationStatesService,
    },
  ],
  exports: [
    {
      provide: Services.CONVERSATIONS,
      useClass: ConversationsService,
    },
    {
      provide: Services.CONVERSATION_STATES,
      useClass: ConversationStatesService,
    },
  ],
})
export class ConversationsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(isAuthorized, ConversationMiddleware).forRoutes({
      path: 'conversations/:id',
      method: RequestMethod.GET,
    });
  }
}
