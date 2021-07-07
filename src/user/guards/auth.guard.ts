import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '../services/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject('JwtService') private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { token, oauth_token } = request.cookies;

    if (!token && !oauth_token) return false;

    // decoded Cookie value
    const { decodedFailed, decodedToken } = this.jwtService.decodeToken(
      token || oauth_token,
    );
    if (decodedFailed) return false;

    if (decodedToken.exp * 1000 < Date.now())
      throw new UnauthorizedException('Token expired, please login again');

    request.user = decodedToken;
    return true;
  }
}
