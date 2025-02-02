// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/common/constants/roles/roles';
import { ROLES_KEY } from 'src/common/decorators/roles/roles';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return false;
    }

    // Decode the token
    const decoded = this.jwtService.decode(token) as JwtService['decode'];

    // Ensure decoded value is an object and contains the 'role' property
    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      !('role' in decoded)
    ) {
      return false;
    }

    const userRole = (decoded as { role: UserRole }).role;

    // Check if user's role matches any of the required roles
    return requiredRoles.some((role) => userRole === role);
  }
}
