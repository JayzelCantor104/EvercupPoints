import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateCustomerDto {
  @IsString() @IsNotEmpty() @Length(1, 50)
  firstName: string;

  @IsString() @IsNotEmpty() @Length(1, 50)
  lastName: string;

  @IsEmail({}, { message: 'A valid email address is required.' })
  email: string;

  @IsOptional() @IsString() @Length(7, 20)
  contactNumber?: string;
}
