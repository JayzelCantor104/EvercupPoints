import { IsBoolean, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateRewardDto {
  @IsOptional() @IsString() @Length(2, 100)
  rewardName?: string;

  @IsOptional() @IsString() @Length(0, 255)
  description?: string;

  @IsOptional() @IsInt() @Min(1)
  pointsRequired?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
