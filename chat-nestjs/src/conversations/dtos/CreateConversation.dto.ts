import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  username: string;

  @IsOptional()
  @IsString()
  message: string;
}
