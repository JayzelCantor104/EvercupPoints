import { IsInt } from 'class-validator';

export class CreateRedemptionDto {
  @IsInt()
  customerId: number;

  @IsInt()
  rewardId: number;
}
