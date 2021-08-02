import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AdminSystemRestrictGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { user_uid } = request.user;
    const { system_uid } = request.params;

    try {
      await this.prisma.usersystemlinks.findFirst({
        where: { AND: [{ user_uid }, { system_uid }] },
        rejectOnNotFound: true,
      });
    } catch (err) {
      return false;
    }
    return true;
  }
}
