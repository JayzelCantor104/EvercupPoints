import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateRewardDto {
  @IsString() @IsNotEmpty() @Length(2, 100)
  rewardName: string;

  @IsOptional() @IsString() @Length(0, 255)
  description?: string;

  @IsInt() @Min(1, { message: 'pointsRequired must be greater than 0.' })
  pointsRequired: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
