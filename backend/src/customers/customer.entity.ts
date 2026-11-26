import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Unique,
} from 'typeorm';
import { PointTransaction } from '../point-transactions/point-transaction.entity';
import { Redemption } from '../redemptions/redemption.entity';

// same constraint names as the sql file
@Entity('customers')
@Unique('UQ_customer_email', ['email'])
@Unique('UQ_customer_qrcode', ['qrCode'])
export class Customer {
  @PrimaryGeneratedColumn({ name: 'CustomerID' })
  customerId: number;

  @Column({ name: 'FirstName', type: 'varchar', length: 50 })
  firstName: string;

  @Column({ name: 'LastName', type: 'varchar', length: 50 })
  lastName: string;

  @Column({ name: 'Email', type: 'varchar', length: 100 })
  email: string;

  @Column({ name: 'ContactNumber', type: 'varchar', length: 20, nullable: true })
  contactNumber: string;

  // value inside the member's QR code
  @Column({ name: 'QRCode', type: 'varchar', length: 100 })
  qrCode: string;

  @Column({ name: 'PointsBalance', type: 'int', default: 0 })
  pointsBalance: number;

  @CreateDateColumn({ name: 'DateRegistered', type: 'datetime' })
  dateRegistered: Date;

  @OneToMany(() => PointTransaction, (t) => t.customer)
  pointTransactions: PointTransaction[];

  @OneToMany(() => Redemption, (r) => r.customer)
  redemptions: Redemption[];
}
