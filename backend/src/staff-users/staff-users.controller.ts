import {
  Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe,
  Patch, Post, Query, Req, UseGuards, BadRequestException,
} from '@nestjs/common';
import { StaffUsersService } from './staff-users.service';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UpdateStaffUserDto } from './dto/update-staff-user.dto';
import { ListQueryDto } from '../common/dto/list-query.dto';
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
  findAll(@Query() q: ListQueryDto) {
    return this.service.findAll(q.page, q.limit, q.isActive);
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStaffUserDto, @Req() req: any) {
    if (id === req.user.staffId && (dto.isActive === false || dto.role === 'Staff')) {
      throw new BadRequestException('You cannot deactivate or demote your own account.');
    }
    return this.service.update(id, dto);
  }

  // DELETE /staff-users/:id
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    if (id === req.user.staffId) {
      throw new BadRequestException('You cannot delete your own account.');
    }
    return this.service.remove(id);
  }
}
