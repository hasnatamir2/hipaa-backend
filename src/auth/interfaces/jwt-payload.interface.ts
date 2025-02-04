import { UserRole } from 'src/common/constants/roles/roles';

// src/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  id: string;
  role: UserRole;
}
