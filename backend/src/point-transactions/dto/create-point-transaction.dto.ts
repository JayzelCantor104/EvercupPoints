import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Length } from 'class-validator';

export class CreatePointTransactionDto {
  @IsInt()
  customerId: number;

  @IsString() @IsNotEmpty() @Length(3, 50)
  receiptNumber: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'purchaseAmount must be greater than 0.' })
  purchaseAmount: number;
}
