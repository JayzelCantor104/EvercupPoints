import {
  Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { PointTransactionsService } from './point-transactions.service';
import { CreatePointTransactionDto } from './dto/create-point-transaction.dto';
import { ListQueryDto } from '../common/dto/list-query.dto';
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
  findAll(@Query() q: ListQueryDto) {
    return this.service.findAll(q.page, q.limit, q.customerId);
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
