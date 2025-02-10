import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../../auth.service';
import { JwtPayload } from '../../interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config/dist/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: JwtPayload) {
    try {
      // Validate the payload structure
      if (!payload || !payload.id) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Validate the user against the service
      const user = await this.authService.getUserById(payload);

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
  // validate(payload: any) {
  //   return { id: payload.sub, username: payload.username };
  // }
}
