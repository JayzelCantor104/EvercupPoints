import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { StaffUsersService } from '../staff-users/staff-users.service';

export interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private staffUsers: StaffUsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // no default secret, it has to be in .env
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // runs after the token is verified, whatever we return becomes req.user
  // checks the db so deactivated staff can't keep using an old token
  async validate(payload: JwtPayload) {
    const staff = await this.staffUsers.findActiveById(payload.sub);
    if (!staff) {
      throw new UnauthorizedException('This account is no longer active. Please contact the admin.');
    }
    return {
      staffId: staff.staffId,
      username: staff.username,
      role: staff.role,
    };
  }
}
