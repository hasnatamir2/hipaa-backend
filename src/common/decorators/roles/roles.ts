import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../constants/roles/roles';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
