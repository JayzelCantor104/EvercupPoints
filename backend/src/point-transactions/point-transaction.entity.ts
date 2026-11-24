import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { StaffUser } from '../staff-users/staff-user.entity';

@Entity('point_transactions')
export class PointTransaction {
  @PrimaryGeneratedColumn({ name: 'TransactionID' })
  transactionId: number;

  @Column({ name: 'CustomerID' })
  customerId: number;

  @Column({ name: 'StaffID' })
  staffId: number;

  // a receipt can only be used once
  @Column({ name: 'ReceiptNumber', type: 'varchar', length: 50, unique: true })
  receiptNumber: string;

  @Column({ name: 'PurchaseAmount', type: 'decimal', precision: 10, scale: 2 })
  purchaseAmount: number;

  @Column({ name: 'PointsEarned', type: 'int' })
  pointsEarned: number;

  @CreateDateColumn({ name: 'TransactionDate', type: 'datetime' })
  transactionDate: Date;

  @ManyToOne(() => Customer, (c) => c.pointTransactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'CustomerID' })
  customer: Customer;

  @ManyToOne(() => StaffUser, (s) => s.pointTransactions)
  @JoinColumn({ name: 'StaffID' })
  staff: StaffUser;
}
