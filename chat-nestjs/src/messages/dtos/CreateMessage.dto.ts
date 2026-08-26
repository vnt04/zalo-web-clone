import { IsOptional, IsString, MaxLength } from 'class-validator';

const MAX_MESSAGE_LENGTH = 4000;

export class CreateMessageDto {
  // Optional chứ không NotEmpty: tin nhắn chỉ có ảnh là hợp lệ, controller đã
  // chặn trường hợp rỗng hoàn toàn bằng EmptyMessageException.
  @IsOptional()
  @IsString()
  @MaxLength(MAX_MESSAGE_LENGTH)
  content: string;
}
