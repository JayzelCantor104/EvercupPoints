import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// query params for the list endpoints
// invalid page/limit returns 400
export class ListQueryDto {
  @IsOptional() @Type(() => Number)
  @IsInt({ message: 'page must be a whole number.' }) @Min(1, { message: 'page starts at 1.' })
  page: number = 1;

  @IsOptional() @Type(() => Number)
  @IsInt({ message: 'limit must be a whole number.' }) @Min(1) @Max(100, { message: 'limit can be at most 100.' })
  limit: number = 20;

  // customers: search by name or email
  @IsOptional() @IsString() @MaxLength(100)
  search?: string;

  // rewards and staff
  @IsOptional() @IsIn(['true', 'false'], { message: 'isActive must be true or false.' })
  isActive?: 'true' | 'false';

  // point transactions and redemptions
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  customerId?: number;
}
