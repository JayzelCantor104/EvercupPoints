import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class CreateStaffUserDto {
  @IsString() @IsNotEmpty() @Length(3, 50)
  username: string;

  @IsString() @MinLength(6, { message: 'Password must be at least 6 characters.' })
  password: string;

  @IsString() @IsNotEmpty() @Length(2, 100)
  fullName: string;

  @IsIn(['Staff', 'Admin'], { message: 'Role must be either Staff or Admin.' })
  role: 'Staff' | 'Admin';

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
