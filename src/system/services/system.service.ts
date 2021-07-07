import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, systems } from '@prisma/client';
import { SelectUser } from 'src/interface/user.interface';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SystemService {
  constructor(private readonly prisma: PrismaService) {}

  async getSystems(params: {
    where?: Prisma.systemsWhereInput;
    orderBy?: Prisma.systemsOrderByInput;
    cursor?: Prisma.systemsWhereUniqueInput;
    take?: number;
    skip?: number;
  }) {
    const { where, orderBy, cursor, take, skip } = params;
    return this.prisma.systems.findMany({
      where,
      orderBy,
      cursor,
      take,
      skip,
      include: { users: { select: { username: true } } },
    });
  }

  async getSpecificSystem(
    systemWhereUniqueInput: Prisma.systemsWhereUniqueInput,
  ) {
    const system = await this.prisma.systems.findUnique({
      where: systemWhereUniqueInput,
    });
    if (!system) throw new NotFoundException('System not found');
    return system;
  }

  async getSystemsByUserAdmin(
    params: {
      orderBy: Prisma.usersystemlinksOrderByInput;
      include: Prisma.usersystemlinksInclude;
    },
    user_uid: string,
  ) {
    return this.prisma.usersystemlinks.findMany({
      where: { user_uid },
      ...params,
    });
  }

  async getSystemByUserNotAdmin(user_uid: string) {
    const systems = await this.prisma.systems.findMany({ take: 20 });
    if (systems.length < 1) throw new NotFoundException('Systems not found');

    const systemsByUserAdmin = await this.prisma.usersystemlinks.findMany({
      where: { user_uid },
      include: { systems: true },
    });

    const systemsByUserNotAdmin = systems.filter((system: systems) => {
      systemsByUserAdmin.forEach(
        (systemByUserAdmin) =>
          system.system_uid !== systemByUserAdmin.system_uid,
      );
    });

    return systemsByUserNotAdmin;
  }

  async createSystem(
    data: Prisma.systemsCreateManyInput,
    imageFile: Express.Multer.File,
  ) {
    let system: systems;
    try {
      system = await this.prisma.systems.create({
        data: { ...data, image_uri: imageFile.filename },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('System name is taken');
      }
      return err;
    }

    await this.prisma.usersystemlinks.create({
      data: { user_uid: data.system_maker, system_uid: system.system_uid },
    });
    return system;
  }

  async deleteSystem(
    system_maker_uid: string,
    systemWhereUniqueInput: Prisma.systemsWhereUniqueInput,
  ) {
    const isUserMaker = await this.prisma.systems.findFirst({
      where: {
        system_maker: system_maker_uid,
        ...systemWhereUniqueInput,
      },
    });
    if (!isUserMaker)
      throw new ForbiddenException("You're not allowed delete this system");
    return this.prisma.systems.delete({ where: systemWhereUniqueInput });
  }

  async updateSystem(
    data: Prisma.systemsUpdateInput,
    systemWhereUniqueInput: Prisma.systemsWhereUniqueInput,
    user_uid: string,
  ) {
    const isUserMaker = await this.prisma.usersystemlinks.findFirst({
      where: {
        ...systemWhereUniqueInput, // system_uid
        user_uid,
      },
    });
    if (!isUserMaker)
      throw new ForbiddenException("You're not allowed update this system");
    return this.prisma.systems.update({ data, where: systemWhereUniqueInput });
  }

  requestToBeAdmin(data: Prisma.notificationsCreateManyInput) {
    return this.prisma.notifications.create({
      data,
    });
  }

  async addAdmin(data: Prisma.usersystemlinksCreateInput) {
    return this.prisma.usersystemlinks.create({
      data,
    });
  }
}
