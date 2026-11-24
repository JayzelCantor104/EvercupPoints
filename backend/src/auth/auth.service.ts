import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { StaffUsersService } from '../staff-users/staff-users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private staffUsers: StaffUsersService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const staff = await this.staffUsers.findByUsername(dto.username);

    // same error for wrong username or wrong password
    if (!staff || !staff.isActive) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const matches = await bcrypt.compare(dto.password, staff.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const token = await this.jwt.signAsync({
      sub: staff.staffId,
      username: staff.username,
      role: staff.role,
    });

    return {
      staffId: staff.staffId,
      username: staff.username,
      fullName: staff.fullName,
      role: staff.role,
      token,
    };
  }
}
