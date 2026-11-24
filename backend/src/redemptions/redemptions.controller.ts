import {
  Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { RedemptionsService } from './redemptions.service';
import { CreateRedemptionDto } from './dto/create-redemption.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('redemptions')
@UseGuards(JwtAuthGuard)
export class RedemptionsController {
  constructor(private service: RedemptionsService) {}

  // GET /redemptions
  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('customerId') customerId?: string,
  ) {
    return this.service.findAll(+page, +limit, customerId ? +customerId : undefined);
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
