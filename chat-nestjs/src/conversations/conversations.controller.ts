import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthenticatedGuard } from '../auth/utils/Guards';
import { Routes, Services } from '../utils/constants';
import { AuthUser } from '../utils/decorators';
import { User } from '../utils/typeorm';
import { IConversationStatesService } from './conversation-states';
import { IConversationsService } from './conversations';
import { CreateConversationDto } from './dtos/CreateConversation.dto';
import { UpdateConversationStateDto } from './dtos/UpdateConversationState.dto';

@SkipThrottle()
@Controller(Routes.CONVERSATIONS)
@UseGuards(AuthenticatedGuard)
export class ConversationsController {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsService: IConversationsService,
    @Inject(Services.CONVERSATION_STATES)
    private readonly conversationStatesService: IConversationStatesService,
    private readonly events: EventEmitter2,
  ) {}
  @Get('test/endpoint/check')
  test() {
    return;
  }

  @Post()
  async createConversation(
    @AuthUser() user: User,
    @Body() createConversationPayload: CreateConversationDto,
  ) {
    console.log('createConversation');
    const conversation = await this.conversationsService.createConversation(
      user,
      createConversationPayload,
    );
    this.events.emit('conversation.create', conversation);
    return conversation;
  }

  @Get()
  async getConversations(@AuthUser() { id }: User) {
    return this.conversationsService.getConversations(id);
  }

  @Post('by-phone-number')
  async getConversationByPhoneNumber(
    @AuthUser() me: User,
    @Body('phoneNumber') phoneNumber: string,
  ) {
    return this.conversationsService.getConversationByPhoneNumber(
      me,
      phoneNumber,
    );
  }

  @Get(':id')
  async getConversationById(@Param('id', ParseIntPipe) id: number) {
    return this.conversationsService.findById(id);
  }

  @Post(':id/read')
  async markAsRead(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.conversationStatesService.markAsRead(user, id);
  }

  @Patch(':id/state')
  async updateConversationState(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConversationStatePayload: UpdateConversationStateDto,
  ) {
    return this.conversationStatesService.updateState(
      user,
      id,
      updateConversationStatePayload,
    );
  }
}
