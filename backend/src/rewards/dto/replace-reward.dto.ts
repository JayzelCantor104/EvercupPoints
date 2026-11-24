import { IsBoolean, IsInt, IsNotEmpty, IsString, Length, Min } from 'class-validator';

// for PUT, all fields required
export class ReplaceRewardDto {
  @IsString() @IsNotEmpty() @Length(2, 100)
  rewardName: string;

  @IsString() @Length(0, 255)
  description: string;

  @IsInt() @Min(1)
  pointsRequired: number;

  @IsBoolean()
  isActive: boolean;
}
