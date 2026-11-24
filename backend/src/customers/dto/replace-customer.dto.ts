import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

// for PUT, all fields required
export class ReplaceCustomerDto {
  @IsString() @IsNotEmpty() @Length(1, 50)
  firstName: string;

  @IsString() @IsNotEmpty() @Length(1, 50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString() @IsNotEmpty() @Length(7, 20)
  contactNumber: string;
}
