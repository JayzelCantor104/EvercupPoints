import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// 401 if there is no valid token
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
