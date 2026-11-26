import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { Reward } from '../rewards/reward.entity';
import { StaffUser } from '../staff-users/staff-user.entity';

@Entity('redemptions')
export class Redemption {
  @PrimaryGeneratedColumn({ name: 'RedemptionID' })
  redemptionId: number;

  @Column({ name: 'CustomerID' })
  customerId: number;

  @Column({ name: 'RewardID' })
  rewardId: number;

  @Column({ name: 'StaffID' })
  staffId: number;

  @Column({ name: 'PointsUsed', type: 'int' })
  pointsUsed: number;

  @CreateDateColumn({ name: 'RedemptionDate', type: 'datetime' })
  redemptionDate: Date;

  @ManyToOne(() => Customer, (c) => c.redemptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'CustomerID', foreignKeyConstraintName: 'FK_rd_customer' })
  customer: Customer;

  @ManyToOne(() => Reward, (r) => r.redemptions)
  @JoinColumn({ name: 'RewardID', foreignKeyConstraintName: 'FK_rd_reward' })
  reward: Reward;

  @ManyToOne(() => StaffUser, (s) => s.redemptions)
  @JoinColumn({ name: 'StaffID', foreignKeyConstraintName: 'FK_rd_staff' })
  staff: StaffUser;
}
