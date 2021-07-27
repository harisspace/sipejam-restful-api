import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Res,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Patch,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { CreateUserDto, SignInUserDto, UpdateUserDto } from './user.dto';
import { UserService } from './services/user.service';
import { AuthGuard } from './guards/auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { OwnUserRestrictGuard } from './guards/own-user-restrict.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UnlinkStaticFilesInterceptor } from 'src/system/interceptors/unlink-static-files.interceptor';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getUsers() {
    return this.userService.getUsers({
      orderBy: { created_at: 'desc' },
      take: 20,
      where: { confirmed: true },
    });
  }

  @Get('profile/:user_uid')
  @UseGuards(AuthGuard)
  async getSpecificUser(@Param('user_uid') user_uid: string) {
    return this.userService.getUser({ user_uid });
  }

  @Get('oauth/google/confirmation')
  @UseInterceptors()
  async googleOAuth(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, token } = await this.userService.googleOAuthService(code);

    res.cookie('token', token, {
      path: '/',
      maxAge: 6048000000,
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'strict',
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    });

    return user;
  }

  @Delete('signout')
  signOutUser(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    res.clearCookie('oauth_token');
    return { success: true };
  }

  @Get('confirmation/:token')
  async confirmationUser(@Param('token') token: string) {
    return this.userService.confirmationUser(token);
  }

  @Get('sendmail/:token')
  async resendEmail(@Param('token') token: string) {
    return this.userService.resendEmail(token);
  }

  @Get('notification/:user_uid')
  @UseGuards(AuthGuard, OwnUserRestrictGuard)
  async getUserNotification(@Param('user_uid') user_uid: string) {
    return this.userService.getUserNotification({
      where: { to_uid: user_uid, read: false },
      take: 20,
      orderBy: { created_at: 'desc' },
      include: { users_notifications_from_uidTousers: true },
    });
  }

  @Get('checkauth')
  @UseGuards(AuthGuard)
  isUserLogin(@Req() req: any) {
    return req.user;
  }

  @Post('signup')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('signin')
  async signInUser(
    @Res({ passthrough: true }) res: Response,
    @Body() signInUserDto: SignInUserDto,
  ) {
    const { user, token } = await this.userService.signInUser(signInUserDto);
    // set cookie
    res.cookie('token', token, {
      path: '/',
      maxAge: 6048000000,
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'strict',
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    });
    return user;
  }

  @Delete('delete/:user_uid')
  @Roles('superadmin')
  @UseGuards(AuthGuard, RolesGuard)
  deleteUser(@Param('user_uid', ParseUUIDPipe) user_uid: string) {
    return this.userService.deleteUser(user_uid);
  }

  @Patch('update/:user_uid')
  @UseGuards(AuthGuard, OwnUserRestrictGuard)
  @UseInterceptors(FileInterceptor('image'), UnlinkStaticFilesInterceptor)
  updateUser(
    @Param('user_uid', ParseUUIDPipe) user_uid: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() fileImage: Express.Multer.File,
  ) {
    return this.userService.updateUser(updateUserDto, { user_uid }, fileImage);
  }

  @Patch('notification/:notification_uid')
  @UseGuards(AuthGuard)
  readNotificationTrue(
    @Query('read', ParseBoolPipe) read: boolean,
    @Param('notification_uid') notification_uid: string,
  ) {
    return this.userService.readNotificationTrue(notification_uid, read);
  }
}
