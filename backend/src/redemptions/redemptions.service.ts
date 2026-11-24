import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Redemption } from './redemption.entity';
import { Customer } from '../customers/customer.entity';
import { Reward } from '../rewards/reward.entity';
import { CreateRedemptionDto } from './dto/create-redemption.dto';

@Injectable()
export class RedemptionsService {
  constructor(
    @InjectRepository(Redemption)
    private repo: Repository<Redemption>,
    private dataSource: DataSource,
  ) {}

  async findAll(page = 1, limit = 20, customerId?: number) {
    const where: any = {};
    if (customerId) where.customerId = customerId;

    const [rows, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { redemptionId: 'DESC' },
    });
    return { page, limit, total, data: rows };
  }

  async findOne(id: number) {
    const redemption = await this.repo.findOne({ where: { redemptionId: id } });
    if (!redemption) throw new NotFoundException(`No redemption exists with ID ${id}.`);
    return redemption;
  }

  // claim a reward and deduct the points in one transaction
  async create(dto: CreateRedemptionDto, staffId: number) {
    return this.dataSource.transaction(async (manager) => {
      const customer = await manager.findOne(Customer, {
        where: { customerId: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException(`No customer exists with ID ${dto.customerId}.`);
      }

      const reward = await manager.findOne(Reward, { where: { rewardId: dto.rewardId } });
      if (!reward) {
        throw new NotFoundException(`No reward exists with ID ${dto.rewardId}.`);
      }
      if (!reward.isActive) {
        throw new BadRequestException(`The reward ${reward.rewardName} is no longer offered.`);
      }
      if (customer.pointsBalance < reward.pointsRequired) {
        throw new BadRequestException(
          `Customer ${customer.customerId} has ${customer.pointsBalance} points but the reward requires ${reward.pointsRequired}.`,
        );
      }

      const redemption = manager.create(Redemption, {
        customerId: customer.customerId,
        rewardId: reward.rewardId,
        staffId,
        pointsUsed: reward.pointsRequired,
      });
      const saved = await manager.save(redemption);

      customer.pointsBalance -= reward.pointsRequired;
      await manager.save(customer);

      return saved;
    });
  }
}
