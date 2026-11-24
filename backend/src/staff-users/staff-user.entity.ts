import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany,
} from 'typeorm';
import { PointTransaction } from '../point-transactions/point-transaction.entity';
import { Redemption } from '../redemptions/redemption.entity';

export type StaffRole = 'Staff' | 'Admin';

@Entity('staff_users')
export class StaffUser {
  @PrimaryGeneratedColumn({ name: 'StaffID' })
  staffId: number;

  @Column({ name: 'Username', type: 'varchar', length: 50, unique: true })
  username: string;

  // removed from responses, see toPublic() in the service
  @Column({ name: 'PasswordHash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'FullName', type: 'varchar', length: 100 })
  fullName: string;

  // varchar(20) like the lab 04 data dictionary, either Staff or Admin
  @Column({ name: 'Role', type: 'varchar', length: 20, default: 'Staff' })
  role: StaffRole;

  @Column({ name: 'IsActive', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'DateCreated', type: 'datetime' })
  dateCreated: Date;

  @OneToMany(() => PointTransaction, (t) => t.staff)
  pointTransactions: PointTransaction[];

  @OneToMany(() => Redemption, (r) => r.staff)
  redemptions: Redemption[];
}
