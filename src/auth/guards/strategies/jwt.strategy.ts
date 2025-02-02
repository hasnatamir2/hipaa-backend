import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../../auth.service';
import { JwtPayload } from '../../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      // Validate the payload structure
      if (!payload || !payload.id) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Validate the user against the service
      const user = await this.authService.validateUser(payload);

      // If no user is found, throw an unauthorized exception
      if (!user) {
        throw new UnauthorizedException('Unauthorized user');
      }

      return user; // Return the valid user
    } catch (err) {
      // Ensure err is of type Error and throw UnauthorizedException
      if (err instanceof Error) {
        throw new UnauthorizedException(err.message);
      } else {
        throw new UnauthorizedException('An unknown error occurred');
      }
    }
  }
}
