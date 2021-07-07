import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { JwtService } from '../services/jwt.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject('JwtService') private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();

    const { token, oauth_token } = request.cookies;

    if (!token && !oauth_token) return false;

    // decoded Cookie value
    const { decodedFailed, decodedToken } = this.jwtService.decodeToken(
      token || oauth_token,
    );
    if (decodedFailed) return false;
    if (
      decodedToken.user_role !== roles[0] &&
      decodedToken.user_role !== roles[1]
    ) {
      return false;
    }

    request.user = decodedToken;
    return true;
  }
}
