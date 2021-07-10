import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class OwnUserRestrictGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { user_uid } = request.user;
    const { user_uid: user_uid_from_param } = request.params;

    if (user_uid !== user_uid_from_param) return false;
    return true;
  }
}
