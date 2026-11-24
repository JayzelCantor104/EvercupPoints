import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffUser } from './staff-user.entity';
import { StaffUsersService } from './staff-users.service';
import { StaffUsersController } from './staff-users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StaffUser])],
  controllers: [StaffUsersController],
  providers: [StaffUsersService],
  exports: [StaffUsersService],
})
export class StaffUsersModule {}
