import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { PointTransaction } from '../point-transactions/point-transaction.entity';
import { Redemption } from '../redemptions/redemption.entity';
import { Reward } from '../rewards/reward.entity';
import { MailService } from '../mail/mail.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ReplaceCustomerDto } from './dto/replace-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private repo: Repository<Customer>,
    private mail: MailService,
  ) {}

  // e.g. EVC-0001-7F3A
  private buildQrCode(id: number) {
    const suffix = Math.random().toString(16).slice(2, 6).toUpperCase();
    return `EVC-${String(id).padStart(4, '0')}-${suffix}`;
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const where = search
      ? [
          { firstName: Like(`%${search}%`) },
          { lastName: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
        ]
      : {};

    const [rows, total] = await this.repo.findAndCount({
      where: where as any,
      skip: (page - 1) * limit,
      take: limit,
      order: { customerId: 'ASC' },
    });
    return { page, limit, total, data: rows };
  }

  async findOne(id: number) {
    const customer = await this.repo.findOne({ where: { customerId: id } });
    if (!customer) throw new NotFoundException(`No customer exists with ID ${id}.`);
    return customer;
  }

  // for the scan page
  async findByQrCode(qrCode: string) {
    const customer = await this.repo.findOne({ where: { qrCode } });
    if (!customer) throw new NotFoundException(`No customer matches the QR code ${qrCode}.`);
    return customer;
  }

  // data for the member card page
  async openCard(email: string, memberCode: string) {
    const member = await this.repo.findOne({ where: { email, qrCode: memberCode } });
    // same message for wrong email or wrong code
    if (!member) {
      throw new UnauthorizedException('That email and member code do not match any EvercupPoints card.');
    }

    const db = this.repo.manager;
    const [visits, claims, menu] = await Promise.all([
      db.find(PointTransaction, {
        where: { customerId: member.customerId },
        order: { transactionId: 'DESC' },
        take: 15,
      }),
      db.find(Redemption, {
        where: { customerId: member.customerId },
        relations: { reward: true },
        order: { redemptionId: 'DESC' },
        take: 15,
      }),
      db.find(Reward, { where: { isActive: true }, order: { pointsRequired: 'ASC' } }),
    ]);

    return {
      member,
      visits: visits.map((v) => ({
        transactionId: v.transactionId,
        receiptNumber: v.receiptNumber,
        purchaseAmount: Number(v.purchaseAmount),
        pointsEarned: v.pointsEarned,
        transactionDate: v.transactionDate,
      })),
      claims: claims.map((c) => ({
        redemptionId: c.redemptionId,
        rewardName: c.reward?.rewardName ?? 'Retired reward',
        pointsUsed: c.pointsUsed,
        redemptionDate: c.redemptionDate,
      })),
      menu: menu.map((r) => ({
        rewardId: r.rewardId,
        rewardName: r.rewardName,
        description: r.description,
        pointsRequired: r.pointsRequired,
      })),
    };
  }

  async create(dto: CreateCustomerDto) {
    const taken = await this.repo.findOne({ where: { email: dto.email } });
    if (taken) {
      throw new ConflictException(`A customer with the email ${dto.email} already exists.`);
    }

    // save first to get the id, then make the QR code from it
    const saved = await this.repo.save(
      this.repo.create({ ...dto, qrCode: `TEMP-${Date.now()}`, pointsBalance: 0 }),
    );
    saved.qrCode = this.buildQrCode(saved.customerId);
    const member = await this.repo.save(saved);

    // member is still saved even if the email fails
    const cardEmailed = await this.mail.sendMemberCard(member);
    return { ...member, cardEmailed };
  }

  // for members who lost their code
  // same reply either way so nobody can use it to check who is a member
  async resendCard(email: string) {
    const member = await this.repo.findOne({ where: { email } });
    if (member) await this.mail.sendMemberCard(member);
    return {
      message: this.mail.isOn
        ? 'If that email belongs to a member, their card is on its way.'
        : 'Email is not set up on this server yet. Ask the staff at the counter for your member code.',
    };
  }

  async update(id: number, dto: UpdateCustomerDto) {
    const customer = await this.findOne(id);
    if (dto.email && dto.email !== customer.email) {
      const taken = await this.repo.findOne({ where: { email: dto.email } });
      if (taken) throw new ConflictException(`A customer with the email ${dto.email} already exists.`);
    }
    Object.assign(customer, dto);
    return this.repo.save(customer);
  }

  async replace(id: number, dto: ReplaceCustomerDto) {
    const customer = await this.findOne(id);
    if (dto.email !== customer.email) {
      const taken = await this.repo.findOne({ where: { email: dto.email } });
      if (taken) throw new ConflictException(`A customer with the email ${dto.email} already exists.`);
    }
    // PUT replaces all fields
    customer.firstName = dto.firstName;
    customer.lastName = dto.lastName;
    customer.email = dto.email;
    customer.contactNumber = dto.contactNumber;
    return this.repo.save(customer);
  }

  async remove(id: number) {
    const customer = await this.findOne(id);
    await this.repo.remove(customer);
  }
}
