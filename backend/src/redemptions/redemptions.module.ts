import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Redemption } from './redemption.entity';
import { RedemptionsService } from './redemptions.service';
import { RedemptionsController } from './redemptions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Redemption])],
  controllers: [RedemptionsController],
  providers: [RedemptionsService],
  exports: [RedemptionsService],
})
export class RedemptionsModule {}
