import {
  Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { RedemptionsService } from './redemptions.service';
import { CreateRedemptionDto } from './dto/create-redemption.dto';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('redemptions')
@UseGuards(JwtAuthGuard)
export class RedemptionsController {
  constructor(private service: RedemptionsService) {}

  // GET /redemptions
  @Get()
  findAll(@Query() q: ListQueryDto) {
    return this.service.findAll(q.page, q.limit, q.customerId);
  }

  // GET /redemptions/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // POST /redemptions (staff or admin)
  @Post()
  @UseGuards(RolesGuard) @Roles('Staff', 'Admin')
  create(@Body() dto: CreateRedemptionDto, @Req() req: any) {
    return this.service.create(dto, req.user.staffId);
  }
}
