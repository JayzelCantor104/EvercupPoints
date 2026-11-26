import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ResendCardDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail({}, { message: 'Enter the email you used when you joined.' })
  email: string;
}
