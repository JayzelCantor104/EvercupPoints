import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// usage: @Roles('Admin')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
