import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ReplaceCustomerDto } from './dto/replace-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private repo: Repository<Customer>,
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
    return this.repo.save(saved);
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
