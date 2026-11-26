import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { StaffUser } from '../staff-users/staff-user.entity';

@Entity('point_transactions')
// a receipt can only be used once
@Unique('UQ_receipt_number', ['receiptNumber'])
export class PointTransaction {
  @PrimaryGeneratedColumn({ name: 'TransactionID' })
  transactionId: number;

  @Column({ name: 'CustomerID' })
  customerId: number;

  @Column({ name: 'StaffID' })
  staffId: number;

  @Column({ name: 'ReceiptNumber', type: 'varchar', length: 50 })
  receiptNumber: string;

  @Column({ name: 'PurchaseAmount', type: 'decimal', precision: 10, scale: 2 })
  purchaseAmount: number;

  @Column({ name: 'PointsEarned', type: 'int' })
  pointsEarned: number;

  @CreateDateColumn({ name: 'TransactionDate', type: 'datetime' })
  transactionDate: Date;

  @ManyToOne(() => Customer, (c) => c.pointTransactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'CustomerID', foreignKeyConstraintName: 'FK_tx_customer' })
  customer: Customer;

  @ManyToOne(() => StaffUser, (s) => s.pointTransactions)
  @JoinColumn({ name: 'StaffID', foreignKeyConstraintName: 'FK_tx_staff' })
  staff: StaffUser;
}
