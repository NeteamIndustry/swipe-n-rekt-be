import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { configService } from '../app.config';

/**
 * Simple shared-secret guard for backend-authority actions (e.g. admin
 * settlement) that don't fit the wallet-based JwtAuthGuard. Reuses the
 * existing SERVER_SECRET config value rather than introducing new admin-auth
 * infrastructure.
 */
@Injectable()
export class ServerSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.headers['x-server-secret'];

    if (!provided || provided !== configService.getServerSecret()) {
      throw new UnauthorizedException(
        'Invalid or missing x-server-secret header',
      );
    }

    return true;
  }
}
