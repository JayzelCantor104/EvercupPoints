import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { StaffUser } from './staff-user.entity';
import { PointTransaction } from '../point-transactions/point-transaction.entity';
import { Redemption } from '../redemptions/redemption.entity';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UpdateStaffUserDto } from './dto/update-staff-user.dto';

@Injectable()
export class StaffUsersService {
  constructor(
    @InjectRepository(StaffUser)
    private repo: Repository<StaffUser>,
  ) {}

  // remove passwordHash before returning
  private toPublic(staff: StaffUser) {
    const { passwordHash, ...safe } = staff;
    return safe;
  }

  // for login only, keeps the hash for bcrypt.compare
  findByUsername(username: string) {
    return this.repo.findOne({ where: { username } });
  }

  // used by JwtStrategy
  findActiveById(staffId: number) {
    return this.repo.findOne({ where: { staffId, isActive: true } });
  }

  async findAll(page = 1, limit = 20, isActive?: string) {
    const where: any = {};
    if (isActive === 'true') where.isActive = true;
    if (isActive === 'false') where.isActive = false;

    const [rows, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { staffId: 'ASC' },
    });
    return { page, limit, total, data: rows.map((r) => this.toPublic(r)) };
  }

  async findOne(id: number) {
    const staff = await this.repo.findOne({ where: { staffId: id } });
    if (!staff) throw new NotFoundException(`No staff account exists with ID ${id}.`);
    return this.toPublic(staff);
  }

  async create(dto: CreateStaffUserDto) {
    const taken = await this.repo.findOne({ where: { username: dto.username } });
    if (taken) {
      throw new ConflictException(`The username ${dto.username} is already taken.`);
    }

    const staff = this.repo.create({
      username: dto.username,
      // hash the password before saving
      passwordHash: await bcrypt.hash(dto.password, 10),
      fullName: dto.fullName,
      role: dto.role,
      isActive: dto.isActive ?? true,
    });
    return this.toPublic(await this.repo.save(staff));
  }

  async update(id: number, dto: UpdateStaffUserDto) {
    const staff = await this.repo.findOne({ where: { staffId: id } });
    if (!staff) throw new NotFoundException(`No staff account exists with ID ${id}.`);

    if (dto.password) staff.passwordHash = await bcrypt.hash(dto.password, 10);
    if (dto.fullName !== undefined) staff.fullName = dto.fullName;
    if (dto.role !== undefined) staff.role = dto.role;
    if (dto.isActive !== undefined) staff.isActive = dto.isActive;

    return this.toPublic(await this.repo.save(staff));
  }

  async remove(id: number) {
    const staff = await this.repo.findOne({ where: { staffId: id } });
    if (!staff) throw new NotFoundException(`No staff account exists with ID ${id}.`);

    // staff with history should be deactivated instead
    const [awards, claims] = await Promise.all([
      this.repo.manager.count(PointTransaction, { where: { staffId: id } }),
      this.repo.manager.count(Redemption, { where: { staffId: id } }),
    ]);
    if (awards + claims > 0) {
      throw new ConflictException(
        `${staff.username} has processed ${awards} point award(s) and ${claims} claim(s), so the account cannot be deleted. ` +
          'Deactivate it instead (PATCH isActive: false) to block their login.',
      );
    }
    await this.repo.remove(staff);
  }
}
