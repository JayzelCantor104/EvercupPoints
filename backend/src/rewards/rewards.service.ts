import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './reward.entity';
import { Redemption } from '../redemptions/redemption.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { ReplaceRewardDto } from './dto/replace-reward.dto';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private repo: Repository<Reward>,
  ) {}

  async findAll(page = 1, limit = 20, isActive?: string) {
    const where: any = {};
    if (isActive === 'true') where.isActive = true;
    if (isActive === 'false') where.isActive = false;

    const [rows, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { pointsRequired: 'ASC' },
    });
    return { page, limit, total, data: rows };
  }

  async findOne(id: number) {
    const reward = await this.repo.findOne({ where: { rewardId: id } });
    if (!reward) throw new NotFoundException(`No reward exists with ID ${id}.`);
    return reward;
  }

  create(dto: CreateRewardDto) {
    return this.repo.save(this.repo.create({ ...dto, isActive: dto.isActive ?? true }));
  }

  async update(id: number, dto: UpdateRewardDto) {
    const reward = await this.findOne(id);
    Object.assign(reward, dto);
    return this.repo.save(reward);
  }

  async replace(id: number, dto: ReplaceRewardDto) {
    const reward = await this.findOne(id);
    reward.rewardName = dto.rewardName;
    reward.description = dto.description;
    reward.pointsRequired = dto.pointsRequired;
    reward.isActive = dto.isActive;
    return this.repo.save(reward);
  }

  async remove(id: number) {
    const reward = await this.findOne(id);

    // can't delete a reward that was already claimed
    const timesClaimed = await this.repo.manager.count(Redemption, { where: { rewardId: id } });
    if (timesClaimed > 0) {
      throw new ConflictException(
        `${reward.rewardName} has been claimed ${timesClaimed} time(s), so it cannot be deleted. ` +
          'Retire it instead (PATCH isActive: false) to take it off the menu.',
      );
    }
    await this.repo.remove(reward);
  }
}
