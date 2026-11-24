import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany,
} from 'typeorm';
import { Redemption } from '../redemptions/redemption.entity';

@Entity('rewards')
export class Reward {
  @PrimaryGeneratedColumn({ name: 'RewardID' })
  rewardId: number;

  @Column({ name: 'RewardName', type: 'varchar', length: 100 })
  rewardName: string;

  @Column({ name: 'Description', type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ name: 'PointsRequired', type: 'int' })
  pointsRequired: number;

  @Column({ name: 'IsActive', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'DateCreated', type: 'datetime' })
  dateCreated: Date;

  @OneToMany(() => Redemption, (r) => r.reward)
  redemptions: Redemption[];
}
