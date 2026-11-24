import {
  Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { PointTransactionsService } from './point-transactions.service';
import { CreatePointTransactionDto } from './dto/create-point-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// no update/delete, transactions are permanent records
@Controller('point-transactions')
@UseGuards(JwtAuthGuard)
export class PointTransactionsController {
  constructor(private service: PointTransactionsService) {}

  // GET /point-transactions
  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('customerId') customerId?: string,
  ) {
    return this.service.findAll(+page, +limit, customerId ? +customerId : undefined);
  }

  // GET /point-transactions/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // POST /point-transactions (staff or admin)
  @Post()
  @UseGuards(RolesGuard) @Roles('Staff', 'Admin')
  create(@Body() dto: CreatePointTransactionDto, @Req() req: any) {
    // staffId comes from the token
    return this.service.create(dto, req.user.staffId);
  }
}
