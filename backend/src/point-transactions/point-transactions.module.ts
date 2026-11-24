import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointTransaction } from './point-transaction.entity';
import { PointTransactionsService } from './point-transactions.service';
import { PointTransactionsController } from './point-transactions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PointTransaction])],
  controllers: [PointTransactionsController],
  providers: [PointTransactionsService],
  exports: [PointTransactionsService],
})
export class PointTransactionsModule {}
