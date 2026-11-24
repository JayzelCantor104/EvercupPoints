import { IsBoolean, IsIn, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class UpdateStaffUserDto {
  @IsOptional() @IsString() @MinLength(6)
  password?: string;

  @IsOptional() @IsString() @Length(2, 100)
  fullName?: string;

  @IsOptional() @IsIn(['Staff', 'Admin'])
  role?: 'Staff' | 'Admin';

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
