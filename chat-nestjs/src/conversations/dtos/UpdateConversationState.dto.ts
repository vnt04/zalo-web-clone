import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateConversationStateDto {
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isMuted?: boolean;
}
