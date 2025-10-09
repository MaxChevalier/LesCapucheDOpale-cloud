import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    console.log('[JwtAuthGuard] Authorization header:', authHeader);

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const payloadAdmin = this.jwtService.verify(token, { secret: process.env.JWT_SECRET_ADMIN });
      console.log('[JwtAuthGuard] Token verified as admin:', payloadAdmin);
      request['user'] = payloadAdmin;
      return true;
    } catch (errAdmin) {
      console.log('[JwtAuthGuard] Not admin token, trying user...', errAdmin.message);
      try {
        const payloadUser = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
        console.log('[JwtAuthGuard] Token verified as user:', payloadUser);
        request['user'] = payloadUser;
        return true;
      } catch (errUser) {
        console.log('[JwtAuthGuard] Invalid token for both:', errUser.message);
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
  }
}
