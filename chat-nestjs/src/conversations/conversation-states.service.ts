import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import {
  Conversation,
  ConversationState,
  Message,
  User,
} from '../utils/typeorm';
import {
  ConversationStateResponse,
  UpdateConversationStateParams,
} from '../utils/types';
import { IConversationStatesService } from './conversation-states';
import { ConversationNotFoundException } from './exceptions/ConversationNotFound';

@Injectable()
export class ConversationStatesService implements IConversationStatesService {
  constructor(
    @InjectRepository(ConversationState)
    private readonly stateRepository: Repository<ConversationState>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async markAsRead(
    user: User,
    conversationId: number,
  ): Promise<ConversationStateResponse> {
    await this.assertParticipant(user.id, conversationId);
    const state = await this.findOrCreate(user, conversationId);
    state.lastReadAt = new Date();
    return this.toResponse(await this.stateRepository.save(state));
  }

  async updateState(
    user: User,
    conversationId: number,
    { isPinned, isMuted }: UpdateConversationStateParams,
  ): Promise<ConversationStateResponse> {
    await this.assertParticipant(user.id, conversationId);
    const state = await this.findOrCreate(user, conversationId);
    if (isPinned !== undefined) state.isPinned = isPinned;
    if (isMuted !== undefined) state.isMuted = isMuted;
    return this.toResponse(await this.stateRepository.save(state));
  }

  /**
   * Gắn unreadCount / isPinned / isMuted của riêng người dùng này vào từng hội
   * thoại, rồi xếp hội thoại ghim lên đầu.
   */
  async attachTo(
    userId: number,
    conversations: Conversation[],
  ): Promise<Conversation[]> {
    if (!conversations.length) return conversations;

    const states = await this.findForUser(userId);
    const stateByConversation = new Map(
      states.map((state) => [state.conversation.id, state]),
    );
    const unreadByConversation = await this.countUnread(
      userId,
      conversations,
      stateByConversation,
    );

    conversations.forEach((conversation) => {
      const state = stateByConversation.get(conversation.id);
      conversation.unreadCount = unreadByConversation.get(conversation.id) ?? 0;
      conversation.isPinned = state?.isPinned ?? false;
      conversation.isMuted = state?.isMuted ?? false;
    });

    // Danh sách đã được sắp theo lastMessageSentAt ở tầng truy vấn, chỉ cần đẩy
    // các hội thoại ghim lên đầu mà giữ nguyên thứ tự tương đối.
    return [
      ...conversations.filter((conversation) => conversation.isPinned),
      ...conversations.filter((conversation) => !conversation.isPinned),
    ];
  }

  private findForUser(userId: number): Promise<ConversationState[]> {
    return this.stateRepository
      .createQueryBuilder('state')
      .leftJoin('state.user', 'user')
      .leftJoinAndSelect('state.conversation', 'conversation')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  /**
   * Đếm tin chưa đọc cho tất cả hội thoại trong một truy vấn. Mỗi hội thoại có
   * mốc lastReadAt riêng nên điều kiện được gom thành các nhánh OR.
   */
  private async countUnread(
    userId: number,
    conversations: Conversation[],
    stateByConversation: Map<number, ConversationState>,
  ): Promise<Map<number, number>> {
    const rows = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.conversation', 'conversation')
      .leftJoin('message.author', 'author')
      .select('conversation.id', 'conversationId')
      .addSelect('COUNT(message.id)', 'count')
      .where('author.id != :userId', { userId })
      .andWhere(
        new Brackets((qb) => {
          conversations.forEach((conversation, index) => {
            const lastReadAt = stateByConversation.get(
              conversation.id,
            )?.lastReadAt;
            if (lastReadAt) {
              qb.orWhere(
                `(conversation.id = :id${index} AND message.createdAt > :readAt${index})`,
                {
                  [`id${index}`]: conversation.id,
                  [`readAt${index}`]: lastReadAt,
                },
              );
            } else {
              // Chưa từng mở hội thoại: mọi tin của người kia đều là chưa đọc.
              qb.orWhere(`conversation.id = :id${index}`, {
                [`id${index}`]: conversation.id,
              });
            }
          });
        }),
      )
      .groupBy('conversation.id')
      .getRawMany();

    return new Map(
      rows.map((row) => [Number(row.conversationId), Number(row.count)]),
    );
  }

  private async assertParticipant(userId: number, conversationId: number) {
    const conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.creator', 'creator')
      .leftJoinAndSelect('conversation.recipient', 'recipient')
      .where('conversation.id = :conversationId', { conversationId })
      .getOne();

    if (!conversation) throw new ConversationNotFoundException();
    if (
      conversation.creator.id !== userId &&
      conversation.recipient.id !== userId
    )
      throw new ForbiddenException('You are not part of this conversation');
  }

  private async findOrCreate(
    user: User,
    conversationId: number,
  ): Promise<ConversationState> {
    const existing = await this.stateRepository
      .createQueryBuilder('state')
      .leftJoin('state.user', 'user')
      .leftJoinAndSelect('state.conversation', 'conversation')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('conversation.id = :conversationId', { conversationId })
      .getOne();
    if (existing) return existing;

    const conversation = await this.conversationRepository.findOne(
      conversationId,
    );
    if (!conversation) throw new NotFoundException('Conversation not found');

    return this.stateRepository.create({
      user,
      conversation,
      lastReadAt: null,
      isPinned: false,
      isMuted: false,
    });
  }

  private toResponse(state: ConversationState): ConversationStateResponse {
    return {
      conversationId: state.conversation.id,
      lastReadAt: state.lastReadAt,
      isPinned: state.isPinned,
      isMuted: state.isMuted,
    };
  }
}
