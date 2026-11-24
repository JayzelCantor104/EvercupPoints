import {
  Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe,
  Patch, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { ReplaceRewardDto } from './dto/replace-reward.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('rewards')
export class RewardsController {
  constructor(private service: RewardsService) {}

  // GET /rewards?isActive= (public)
  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('isActive') isActive?: string,
  ) {
    return this.service.findAll(+page, +limit, isActive);
  }

  // GET /rewards/:id (public)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // POST /rewards (admin)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Admin')
  create(@Body() dto: CreateRewardDto) {
    return this.service.create(dto);
  }

  // PUT /rewards/:id (admin)
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Admin')
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: ReplaceRewardDto) {
    return this.service.replace(id, dto);
  }

  // PATCH /rewards/:id (admin)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRewardDto) {
    return this.service.update(id, dto);
  }

  // DELETE /rewards/:id (admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Admin')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
