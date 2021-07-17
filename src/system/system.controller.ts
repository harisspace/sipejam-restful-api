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
import { OwnUserRestrictGuard } from 'src/user/guards/own-user-restrict.guard';
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

@Controller('system')
export class SystemController {
  constructor(private systemService: SystemService) {}

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
  getSystemsByUserAmin(@Param('user_uid') user_uid: string) {
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

  @Post('create')
  @Roles('superadmin')
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  createSystem(
    @Body() createSystemDto: CreateSystemDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.systemService.createSystem(createSystemDto, image);
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
  deleteSystem(@Param('system_uid') system_uid: string) {
    return this.systemService.deleteSystem({ system_uid });
  }

  @Patch('update/:system_uid')
  @Roles('superadmin', 'admin')
  @UseGuards(AuthGuard, RolesGuard, AdminSystemRestrictGuard)
  @UseInterceptors(FileInterceptor('image'), UnlinkStaticFilesInterceptor)
  updateSystem(
    @Param('system_uid') system_uid: string,
    @Body() updateSystemDto: UpdateSystemDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return this.systemService.updateSystem(
      updateSystemDto,
      { system_uid },
      imageFile,
    );
  }
}
