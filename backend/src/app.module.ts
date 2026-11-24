import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { StaffUsersModule } from './staff-users/staff-users.module';
import { CustomersModule } from './customers/customers.module';
import { RewardsModule } from './rewards/rewards.module';
import { PointTransactionsModule } from './point-transactions/point-transactions.module';
import { RedemptionsModule } from './redemptions/redemptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '3306'), 10),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_DATABASE', 'evercuppoints'),
        autoLoadEntities: true,
        // auto create/update tables from the entities
        synchronize: true,
      }),
    }),
    AuthModule,
    StaffUsersModule,
    CustomersModule,
    RewardsModule,
    PointTransactionsModule,
    RedemptionsModule,
  ],
})
export class AppModule {}
