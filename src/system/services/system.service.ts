import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { notifications, Prisma, systems } from '@prisma/client';
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
      include: { users: true },
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
    const systems = await this.prisma.systems.findMany({
      take: 20,
      include: { users: true },
      orderBy: { created_at: 'desc' },
      where: { usersystemlinks: { every: { NOT: { user_uid } } } },
    });

    return systems;
  }

  async getSystemByUserCreatedSystem(params: {
    where: Prisma.systemsWhereInput;
    include: Prisma.systemsInclude;
    orderBy: Prisma.systemsOrderByInput;
  }) {
    const { where, include, orderBy } = params;
    return this.prisma.systems.findMany({ where, include, orderBy });
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
        throw new BadRequestException('System name is taken', err.message);
      }
      return err;
    }

    await this.prisma.usersystemlinks.create({
      data: { user_uid: data.system_maker, system_uid: system.system_uid },
    });
    return system;
  }

  async deleteSystem(systemWhereUniqueInput: Prisma.systemsWhereUniqueInput) {
    let system: systems;

    try {
      system = await this.prisma.systems.delete({
        where: systemWhereUniqueInput,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException(err.message);
      }
      throw new InternalServerErrorException();
    }
    return system;
  }

  async updateSystem(
    data: Prisma.systemsUpdateInput,
    systemWhereUniqueInput: Prisma.systemsWhereUniqueInput,
    imageFile: Express.Multer.File,
  ) {
    let system: systems;
    try {
      system = await this.prisma.systems.update({
        data: { ...data, image_uri: imageFile.filename },
        where: systemWhereUniqueInput,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError)
        throw new ConflictException('Invalid name already exist');
      throw new InternalServerErrorException();
    }
    return system;
  }

  async requestToBeAdmin(data: Prisma.notificationsCreateManyInput) {
    const notifications = await this.prisma.notifications.findMany({
      where: data,
    });
    if (notifications.length >= 1) {
      throw new ForbiddenException(
        'You request more than 1, please wait admin for confirmation',
      );
    }
    return this.prisma.notifications.create({
      data,
    });
  }

  async addAdmin(data: Prisma.usersystemlinksCreateManyInput) {
    const userSystemLinks = await this.prisma.usersystemlinks.findFirst({
      where: data,
    });
    if (userSystemLinks)
      throw new ForbiddenException("You're already admin in this system");
    // change user role from user to admin
    await this.prisma.users.update({
      where: { user_uid: data.user_uid },
      data: { user_role: 'admin' },
    });
    return this.prisma.usersystemlinks.create({
      data,
    });
  }

  async getAllSpeed1Data(params: {
    where?: Prisma.systemsWhereUniqueInput;
    cursor?: Prisma.speeds1WhereUniqueInput;
    skip?: number;
    orderBy?: Prisma.speeds1OrderByInput;
    take?: number;
  }) {
    const { cursor, where, orderBy, skip, take } = params;
    const { iot_token } = await this.prisma.systems.findUnique({
      where,
      select: { iot_token: true },
    });
    if (!iot_token) throw new NotFoundException('System not found');
    return this.prisma.speeds1.findMany({
      where: { iot_token },
      orderBy,
      cursor,
      take,
      skip,
    });
  }

  async getAllSpeed2Data(params: {
    where?: Prisma.systemsWhereUniqueInput;
    cursor?: Prisma.speeds2WhereUniqueInput;
    skip?: number;
    orderBy?: Prisma.speeds2OrderByInput;
    take?: number;
  }) {
    const { cursor, where, orderBy, skip, take } = params;
    const { iot_token } = await this.prisma.systems.findUnique({
      where,
      select: { iot_token: true },
    });
    if (!iot_token) throw new NotFoundException('System not found');
    return this.prisma.speeds2.findMany({
      where: { iot_token },
      orderBy,
      cursor,
      take,
      skip,
    });
  }

  async getAllVehicle1Data(params: {
    where?: Prisma.systemsWhereUniqueInput;
    cursor?: Prisma.vehicles1WhereUniqueInput;
    skip?: number;
    orderBy?: Prisma.vehicles1OrderByInput;
    take?: number;
  }) {
    const { cursor, where, orderBy, skip, take } = params;
    const { iot_token } = await this.prisma.systems.findUnique({
      where,
      select: { iot_token: true },
    });
    if (!iot_token) throw new NotFoundException('System not found');
    return this.prisma.vehicles1.findMany({
      where: { iot_token },
      orderBy,
      cursor,
      take,
      skip,
    });
  }

  async getAllVehicle2Data(params: {
    where?: Prisma.systemsWhereUniqueInput;
    cursor?: Prisma.vehicles2WhereUniqueInput;
    skip?: number;
    orderBy?: Prisma.vehicles2OrderByInput;
    take?: number;
  }) {
    const { cursor, where, orderBy, skip, take } = params;
    const { iot_token } = await this.prisma.systems.findUnique({
      where,
      select: { iot_token: true },
    });
    if (!iot_token) throw new NotFoundException('System not found');
    return this.prisma.vehicles2.findMany({
      where: { iot_token },
      orderBy,
      cursor,
      take,
      skip,
    });
  }

  async getAllSmallVehicle1Data(params: {
    where?: Prisma.systemsWhereUniqueInput;
    cursor?: Prisma.smallvehicles1WhereUniqueInput;
    skip?: number;
    orderBy?: Prisma.smallvehicles1OrderByInput;
    take?: number;
  }) {
    const { cursor, where, orderBy, skip, take } = params;
    const { iot_token } = await this.prisma.systems.findUnique({
      where,
      select: { iot_token: true },
    });
    if (!iot_token) throw new NotFoundException('System not found');
    return this.prisma.smallvehicles1.findMany({
      where: { iot_token },
      orderBy,
      cursor,
      take,
      skip,
    });
  }

  async getAllSmallVehicle2Data(params: {
    where?: Prisma.systemsWhereUniqueInput;
    cursor?: Prisma.smallvehicles2WhereUniqueInput;
    skip?: number;
    orderBy?: Prisma.smallvehicles2OrderByInput;
    take?: number;
  }) {
    const { cursor, where, orderBy, skip, take } = params;
    const { iot_token } = await this.prisma.systems.findUnique({
      where,
      select: { iot_token: true },
    });
    if (!iot_token) throw new NotFoundException('System not found');
    return this.prisma.smallvehicles2.findMany({
      where: { iot_token },
      orderBy,
      cursor,
      take,
      skip,
    });
  }
}
