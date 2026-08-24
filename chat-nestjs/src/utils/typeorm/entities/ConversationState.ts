import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conversation } from './Conversation';
import { User } from './User';

/**
 * Trạng thái riêng của từng người trong một hội thoại: đã đọc tới đâu, có ghim
 * hay tắt thông báo không. Tách khỏi Conversation vì hai phía của cùng một hội
 * thoại có trạng thái khác nhau.
 */
@Entity({ name: 'conversation_states' })
@Index(['user.id', 'conversation.id'], { unique: true })
export class ConversationState {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Conversation, { createForeignKeyConstraints: false })
  @JoinColumn()
  conversation: Conversation;

  // null = chưa đọc tin nào, toàn bộ tin của người kia đều tính là chưa đọc.
  @Column({ name: 'last_read_at', type: 'datetime', nullable: true })
  lastReadAt: Date | null;

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean;

  @Column({ name: 'is_muted', default: false })
  isMuted: boolean;
}
