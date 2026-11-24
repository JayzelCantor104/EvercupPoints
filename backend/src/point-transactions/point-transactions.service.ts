import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PointTransaction } from './point-transaction.entity';
import { Customer } from '../customers/customer.entity';
import { CreatePointTransactionDto } from './dto/create-point-transaction.dto';

// 1 point per 10 pesos
const PESOS_PER_POINT = 10;

@Injectable()
export class PointTransactionsService {
  constructor(
    @InjectRepository(PointTransaction)
    private repo: Repository<PointTransaction>,
    private dataSource: DataSource,
  ) {}

  async findAll(page = 1, limit = 20, customerId?: number) {
    const where: any = {};
    if (customerId) where.customerId = customerId;

    const [rows, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { transactionId: 'DESC' },
    });
    return { page, limit, total, data: rows };
  }

  async findOne(id: number) {
    const tx = await this.repo.findOne({ where: { transactionId: id } });
    if (!tx) throw new NotFoundException(`No transaction exists with ID ${id}.`);
    return tx;
  }

  // add points for a purchase
  // in a transaction so the record and the balance save together
  async create(dto: CreatePointTransactionDto, staffId: number) {
    const duplicate = await this.repo.findOne({
      where: { receiptNumber: dto.receiptNumber },
    });
    if (duplicate) {
      throw new ConflictException(
        `Points for receipt ${dto.receiptNumber} were already awarded.`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const customer = await manager.findOne(Customer, {
        where: { customerId: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException(`No customer exists with ID ${dto.customerId}.`);
      }

      const pointsEarned = Math.floor(dto.purchaseAmount / PESOS_PER_POINT);

      const tx = manager.create(PointTransaction, {
        customerId: dto.customerId,
        staffId,
        receiptNumber: dto.receiptNumber,
        purchaseAmount: dto.purchaseAmount,
        pointsEarned,
      });
      const saved = await manager.save(tx);

      customer.pointsBalance += pointsEarned;
      await manager.save(customer);

      return saved;
    });
  }
}
