import {
  Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe,
  Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { StaffUsersService } from './staff-users.service';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UpdateStaffUserDto } from './dto/update-staff-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// admin only
@Controller('staff-users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class StaffUsersController {
  constructor(private service: StaffUsersService) {}

  // GET /staff-users
  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('isActive') isActive?: string,
  ) {
    return this.service.findAll(+page, +limit, isActive);
  }

  // GET /staff-users/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // POST /staff-users
  @Post()
  create(@Body() dto: CreateStaffUserDto) {
    return this.service.create(dto);
  }

  // PATCH /staff-users/:id
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStaffUserDto) {
    return this.service.update(id, dto);
  }

  // DELETE /staff-users/:id
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
