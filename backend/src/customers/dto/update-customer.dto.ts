import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

// for PATCH, all fields optional
export class UpdateCustomerDto {
  @IsOptional() @IsString() @Length(1, 50)
  firstName?: string;

  @IsOptional() @IsString() @Length(1, 50)
  lastName?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString() @Length(7, 20)
  contactNumber?: string;
}
