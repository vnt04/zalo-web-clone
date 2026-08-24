import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  message: string;
}
