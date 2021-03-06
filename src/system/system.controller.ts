import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SelectUser } from 'src/interface/user.interface';
import { Roles } from 'src/user/decorators/roles.decorator';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { AdminSystemRestrictGuard } from './guards/admin-system-restrict.guard';
import { SystemMakerRestrictGuard } from './guards/system-maker-restrict.guard';
import { UnlinkStaticFilesInterceptor } from './interceptors/unlink-static-files.interceptor';
import { SystemService } from './services/system.service';
import {
  AddAdminDto,
  CreateSystemDto,
  RequestToBeAdminDto,
  UpdateSystemDto,
} from './system.dto';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Controller('system')
export class SystemController {
  constructor(
    private systemService: SystemService,
    private configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  getSystems() {
    return this.systemService.getSystems({
      orderBy: { created_at: 'desc' },
      take: 20,
    });
  }

  @Get(':system_uid')
  @UseGuards(AuthGuard)
  getSpecificSystem(@Param('system_uid') system_uid: string) {
    return this.systemService.getSpecificSystem({ system_uid });
  }

  @Get('admin/:user_uid')
  @UseGuards(AuthGuard)
  async getSystemsByUserAdmin(@Param('user_uid') user_uid: string) {
    return this.systemService.getSystemsByUserAdmin(
      {
        orderBy: { created_at: 'desc' },
        include: { systems: true, users: { select: SelectUser } },
      },
      user_uid,
    );
  }

  @Get('notadmin/:user_uid')
  @UseGuards(AuthGuard)
  getSystemsByUserNotAdmin(@Param('user_uid') user_uid: string) {
    return this.systemService.getSystemByUserNotAdmin(user_uid);
  }

  @Get('checkadmin/:system_uid')
  @UseGuards(AuthGuard, AdminSystemRestrictGuard)
  checkAdminSystem() {
    return { is_admin: true };
  }

  @Get('usercreated/:user_uid')
  @UseGuards(AuthGuard)
  getSystemsByUserCreatedSystem(@Param('user_uid') user_uid: string) {
    return this.systemService.getSystemByUserCreatedSystem({
      where: { system_maker: user_uid },
      include: { users: true },
      orderBy: { created_at: 'desc' },
    });
  }

  @Get('speed1/:system_uid')
  @Roles('admin', 'superadmin')
  @UseGuards(AuthGuard, RolesGuard, AdminSystemRestrictGuard)
  getAllSpeed1Data(@Param('system_uid') system_uid: string) {
    return this.systemService.getAllSpeed1Data({
      where: { system_uid },
      orderBy: { created_at: 'desc' },
      take: 20,
    });
  }

  @Get('speed2/:system_uid')
  @Roles('admin', 'superadmin')
  @UseGuards(AuthGuard, RolesGuard, AdminSystemRestrictGuard)
  getAllSpeed2Data(@Param('system_uid') system_uid: string) {
    return this.systemService.getAllSpeed2Data({
      where: { system_uid },
      orderBy: { created_at: 'desc' },
      take: 20,
    });
  }

  @Get('vehicle1/:system_uid')
  @Roles('admin', 'superadmin')
  @UseGuards(AuthGuard, RolesGuard, AdminSystemRestrictGuard)
  getAllVehicle1Data(@Param('system_uid') system_uid: string) {
    return this.systemService.getAllVehicle1Data({
      where: { system_uid },
      orderBy: { created_at: 'desc' },
      take: 20,
    });
  }

  @Get('vehicle2/:system_uid')
  @Roles('admin', 'superadmin')
  @UseGuards(AuthGuard, RolesGuard, AdminSystemRestrictGuard)
  getAllVehicle2Data(@Param('system_uid') system_uid: string) {
    return this.systemService.getAllVehicle2Data({
      where: { system_uid },
      orderBy: { created_at: 'desc' },
      take: 20,
    });
  }

  @Get('smallvehicle1/:system_uid')
  @Roles('admin', 'superadmin')
  @UseGuards(AuthGuard, RolesGuard, AdminSystemRestrictGuard)
  getAllSmallVehicle1Data(@Param('system_uid') system_uid: string) {
    return this.systemService.getAllSmallVehicle1Data({
      where: { system_uid },
      orderBy: { created_at: 'desc' },
      take: 20,
    });
  }

  @Get('smallvehicle2/:system_uid')
  @Roles('admin', 'superadmin')
  @UseGuards(AuthGuard, RolesGuard, AdminSystemRestrictGuard)
  getAllSmallVehicle2Data(@Param('system_uid') system_uid: string) {
    return this.systemService.getAllSmallVehicle2Data({
      where: { system_uid },
      orderBy: { created_at: 'desc' },
      take: 20,
    });
  }

  @Post('create')
  @Roles('superadmin')
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createSystem(
    @Body() createSystemDto: CreateSystemDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const iot_token = createHmac(
      'sha256',
      this.configService.get<string>('ENCRYPT_KEY'),
    )
      .update(createSystemDto.name)
      .digest('hex');

    return this.systemService.createSystem(
      { ...createSystemDto, iot_token },
      image,
    );
  }

  @Post('join')
  @UseGuards(AuthGuard)
  requestToBeAdmin(@Body() requestToBeAdminDto: RequestToBeAdminDto) {
    return this.systemService.requestToBeAdmin(requestToBeAdminDto);
  }

  @Post('add')
  @Roles('superadmin')
  @UseGuards(AuthGuard, RolesGuard)
  addAdmin(@Body() addAdminDto: AddAdminDto) {
    return this.systemService.addAdmin(addAdminDto);
  }

  @Delete('delete/:system_uid')
  @Roles('superadmin')
  @UseGuards(AuthGuard, RolesGuard, SystemMakerRestrictGuard)
  @UseInterceptors(UnlinkStaticFilesInterceptor)
  deleteSystem(@Param('system_uid') system_uid: string) {
    return this.systemService.deleteSystem({ system_uid });
  }

  @Patch('update/:system_uid')
  @Roles('superadmin', 'admin')
  @UseGuards(AuthGuard, RolesGuard, AdminSystemRestrictGuard)
  updateSystem(
    @Param('system_uid') system_uid: string,
    @Body() updateSystemDto: UpdateSystemDto,
  ) {
    return this.systemService.updateSystem(updateSystemDto, { system_uid });
  }

  @Patch('upload/image/:system_uid')
  @Roles('superadmin', 'admin')
  @UseGuards(AuthGuard, RolesGuard, AdminSystemRestrictGuard)
  @UseInterceptors(FileInterceptor('image'), UnlinkStaticFilesInterceptor)
  async uploadImageSystem(
    @Param('system_uid') system_uid: string,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return this.systemService.uploadImageSystem({ system_uid }, imageFile);
  }
}
