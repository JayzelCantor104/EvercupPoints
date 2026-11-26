import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

// email + member code (the code under the QR)
// both have to belong to the same member
export class OpenCardDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail({}, { message: 'Enter the email you used when you joined.' })
  email: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString() @IsNotEmpty({ message: 'Enter your member code.' }) @Length(3, 100)
  memberCode: string;
}
