import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SystemMakerRestrictGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { user_uid } = request.user;
    const { system_uid } = request.params;

    try {
      await this.prisma.systems.findFirst({
        where: { AND: [{ system_maker: user_uid }, { system_uid }] },
      });
    } catch (err) {
      return false;
    }

    return true;
  }
}
