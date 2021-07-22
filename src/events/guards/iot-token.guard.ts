import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class IotTokenGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    // console.log('client', client);
    const { iot_token, meta }: { iot_token: string; meta: string } = context
      .switchToWs()
      .getData();
    if (!iot_token && !meta) return false;

    // if have iot token and valid broadcast that iot token
    try {
      const system = await this.prisma.systems.findUnique({
        where: { iot_token },
        rejectOnNotFound: true,
      });
      if (system) {
        client.system_uid = system.system_uid;
        return true;
      }
    } catch (err) {
      return false;
    }
  }
}
