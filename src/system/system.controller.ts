import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SelectUser } from 'src/interface/user.interface';
import { Roles } from 'src/user/decorators/roles.decorator';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { AdminSystemRestrictGuard } from './guard/admin-system-restrict.guard';
import { SystemMakerRestrictGuard } from './guard/system-maker-restrict.guard';
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

  @Get(':systemUid')
  @UseGuards(AuthGuard)
  getSpecificSystem(@Param('systemUid') system_uid: string) {
    return this.systemService.getSpecificSystem({ system_uid });
  }

  @Get('admin/:userUid')
  getSystemsByUserAmin(@Param('userUid') user_uid: string) {
    return this.systemService.getSystemsByUserAdmin(
      {
        orderBy: { created_at: 'desc' },
        include: { systems: true, users: { select: SelectUser } },
      },
      user_uid,
    );
  }

  @Get('notadmin/:userUid')
  getSystemsByUserNotAdmin(@Param('userUid') user_uid: string) {
    return this.systemService.getSystemByUserNotAdmin(user_uid);
  }

  @Post('create')
  @Roles('superadmin')
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  createSystem(
    @Body() createSystemDto: CreateSystemDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.systemService.createSystem(createSystemDto, image);
  }

  @Delete('delete/:system_uid')
  @Roles('superadmin')
  @UseGuards(RolesGuard, SystemMakerRestrictGuard)
  deleteSystem(@Req() req: any, @Param('system_uid') system_uid: string) {
    return this.systemService.deleteSystem({ system_uid });
  }

  @Post('join')
  @UseGuards(AuthGuard)
  requestToBeAdmin(@Body() requestToBeAdminDto: RequestToBeAdminDto) {
    return this.systemService.requestToBeAdmin(requestToBeAdminDto);
  }

  @Post('add')
  @Roles('superadmin')
  @UseGuards(RolesGuard)
  addAdmin(@Body() addAdminDto: AddAdminDto) {
    return this.systemService.addAdmin(addAdminDto);
  }

  @Patch('update/:system_uid')
  @Roles('superadmin', 'admin')
  @UseGuards(AuthGuard, AdminSystemRestrictGuard)
  @UseInterceptors(FileInterceptor('image'))
  updateSystem(
    @Param('system_uid') system_uid: string,
    @Body() updateSystemDto: UpdateSystemDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    console.log(imageFile);
    return this.systemService.updateSystem(
      updateSystemDto,
      { system_uid },
      imageFile,
    );
  }
}
