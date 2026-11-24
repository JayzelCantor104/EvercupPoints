import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // POST /auth/login (public)
  @Post('login')
  @HttpCode(201)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  // GET /auth/profile - returns the logged in user
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@Req() req: any) {
    return req.user;
  }
}
