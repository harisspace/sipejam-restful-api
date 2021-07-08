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
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { CreateUserDto, SignInUserDto } from './user.dto';
import { UserService } from './services/user.service';
import { AuthGuard } from './guards/auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  getUsers() {
    return this.userService.getUsers({
      orderBy: { created_at: 'desc' },
      take: 20,
      where: { confirmed: true },
    });
  }

  @Get('profile/:user_uid')
  async getSpecificUser(@Param() user_uid: string) {
    return this.userService.getUser({ user_uid });
  }

  @Get('signout')
  @UseGuards(AuthGuard)
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

  // @Get('/notification')
  // async getUserNotification() {}

  @Post('signup')
  async createUser(@Body() createUserDto: CreateUserDto) {
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
      sameSite: 'none',
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    });
    return user;
  }

  @Delete('delete/:user_uid')
  @Roles('superadmin')
  @UseGuards(RolesGuard)
  async deleteUser(@Param('user_uid', ParseUUIDPipe) user_uid: string) {
    return this.userService.deleteUser(user_uid);
  }

  @Get('checkauth')
  @UseGuards(AuthGuard)
  isUserLogin(@Req() req: any) {
    return req.user;
  }
}
