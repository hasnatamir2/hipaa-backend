import { UserRole } from 'src/common/constants/roles/roles.enum';

// src/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  id: string;
  role: UserRole;
}
