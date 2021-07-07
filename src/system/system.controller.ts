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
import { HelperService } from './services/helper.service';
import { SystemService } from './services/system.service';
import {
  CreateSystemDto,
  RequestToBeAdminDto,
  UpdateSystemDto,
} from './system.dto';

@Controller('system')
export class SystemController {
  constructor(
    private systemService: SystemService,
    private helperService: HelperService,
  ) {}

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
    console.log(image);
    return this.systemService.createSystem(createSystemDto, image);
  }

  @Delete('delete/:systemUid')
  @Roles('superadmin')
  @UseGuards(RolesGuard)
  deleteSystem(@Req() req: any, @Param('systemUid') systemUid: string) {
    const { user_uid } = req.user;
    return this.systemService.deleteSystem(user_uid, { system_uid: systemUid });
  }

  @Patch('update/:systemUid')
  @Roles('superadmin', 'admin')
  updateSystem(
    @Req() req: any,
    @Param('systemUid') system_uid: string,
    @Body() updateSystemDto: UpdateSystemDto,
  ) {
    const { user_uid } = req.user;
    return this.systemService.updateSystem(
      updateSystemDto,
      { system_uid },
      user_uid,
    );
  }

  @Post('/join')
  @UseGuards(AuthGuard)
  requestToBeAdmin(
    @Req() req: any,
    @Body() requestToBeAdminDto: RequestToBeAdminDto,
  ) {
    return this.systemService.requestToBeAdmin(requestToBeAdminDto);
  }

  // @Post('/add/:systemUid')
  // addAdmin() {}
}
