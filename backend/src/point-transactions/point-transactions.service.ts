import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
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
    const alreadyClaimed = () =>
      new ConflictException(`Points for receipt ${dto.receiptNumber} were already awarded.`);

    try {
      return await this.dataSource.transaction(async (manager) => {
        // lock the customer row so two requests can't change the balance at the same time
        const customer = await manager.findOne(Customer, {
          where: { customerId: dto.customerId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!customer) {
          throw new NotFoundException(`No customer exists with ID ${dto.customerId}.`);
        }

        const duplicate = await manager.findOne(PointTransaction, {
          where: { receiptNumber: dto.receiptNumber },
        });
        if (duplicate) throw alreadyClaimed();

        const pointsEarned = Math.floor(dto.purchaseAmount / PESOS_PER_POINT);

        const saved = await manager.save(
          manager.create(PointTransaction, {
            customerId: dto.customerId,
            staffId,
            receiptNumber: dto.receiptNumber,
            purchaseAmount: dto.purchaseAmount,
            pointsEarned,
          }),
        );

        customer.pointsBalance += pointsEarned;
        await manager.save(customer);

        return saved;
      });
    } catch (err) {
      // same receipt sent twice at the same time
      if (err instanceof QueryFailedError && (err as any).driverError?.code === 'ER_DUP_ENTRY') {
        throw alreadyClaimed();
      }
      throw err;
    }
  }
}
