import { IsNotEmpty } from 'class-validator';

export class AddGroupRecipientDto {
  @IsNotEmpty()
  phoneNumber: string;
}
