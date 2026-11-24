import {
  Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe,
  Patch, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ReplaceCustomerDto } from './dto/replace-customer.dto';
import { PointTransactionsService } from '../point-transactions/point-transactions.service';
import { RedemptionsService } from '../redemptions/redemptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('customers')
export class CustomersController {
  constructor(
    private service: CustomersService,
    private pointTransactions: PointTransactionsService,
    private redemptions: RedemptionsService,
  ) {}

  // GET /customers?search=&page=
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.service.findAll(+page, +limit, search);
  }

  // GET /customers/qr/:qrCode - used by the scan page
  @Get('qr/:qrCode')
  @UseGuards(JwtAuthGuard)
  findByQr(@Param('qrCode') qrCode: string) {
    return this.service.findByQrCode(qrCode);
  }

  // GET /customers/:id
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // GET /customers/:id/point-transactions
  @Get(':id/point-transactions')
  @UseGuards(JwtAuthGuard)
  async history(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    await this.service.findOne(id); // 404 if not found
    return this.pointTransactions.findAll(+page, +limit, id);
  }

  // GET /customers/:id/redemptions
  @Get(':id/redemptions')
  @UseGuards(JwtAuthGuard)
  async claims(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    await this.service.findOne(id);
    return this.redemptions.findAll(+page, +limit, id);
  }

  // POST /customers - sign up (public)
  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.service.create(dto);
  }

  // PATCH /customers/:id (admin)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCustomerDto) {
    return this.service.update(id, dto);
  }

  // PUT /customers/:id (admin)
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: ReplaceCustomerDto) {
    return this.service.replace(id, dto);
  }

  // DELETE /customers/:id (admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
