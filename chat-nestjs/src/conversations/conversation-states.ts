import { Conversation, User } from '../utils/typeorm';
import {
  ConversationStateResponse,
  UpdateConversationStateParams,
} from '../utils/types';

export interface IConversationStatesService {
  markAsRead(
    user: User,
    conversationId: number,
  ): Promise<ConversationStateResponse>;
  updateState(
    user: User,
    conversationId: number,
    params: UpdateConversationStateParams,
  ): Promise<ConversationStateResponse>;
  attachTo(
    userId: number,
    conversations: Conversation[],
  ): Promise<Conversation[]>;
}
