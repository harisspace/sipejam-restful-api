import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { notifications, Prisma, users } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { SelectUser } from '../../interface/user.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from './jwt.service';
import { EmailService } from './email.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private httpService: HttpService,
  ) {}

  async getUser(userWhereUniqueInput: Prisma.usersWhereUniqueInput) {
    return this.prisma.users.findUnique({
      where: userWhereUniqueInput,
      select: SelectUser,
    });
  }

  async getUsers(params: {
    cursor?: Prisma.usersWhereUniqueInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.usersOrderByInput;
    where?: Prisma.usersWhereInput;
  }): Promise<Partial<users>[]> {
    const { cursor, skip, take, orderBy, where } = params;
    return this.prisma.users.findMany({
      where,
      skip,
      take,
      orderBy,
      cursor,
      select: SelectUser,
    });
  }

  async getUserNotification(params: {
    where: Prisma.notificationsWhereInput;
    take?: number;
    orderBy?: Prisma.notificationsOrderByInput;
    include?: Prisma.notificationsInclude;
  }) {
    const { where, orderBy, take, include } = params;
    return this.prisma.notifications.findMany({
      where,
      take,
      orderBy,
      include,
    });
  }

  async createUser(data: Prisma.usersCreateInput): Promise<Partial<users>> {
    // find unique constrain is already registered or not
    const user = await this.prisma.users.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });

    if (user && user.oauth === false) {
      throw new BadRequestException('Username or Email is already registered');
    }

    // hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // if is oauth true and user exist update password
    let userDB: Partial<users> | null = null;
    if (user) {
      userDB = await this.prisma.users.update({
        data: {
          password: hashedPassword,
          username: data.username,
          oauth: false,
        },
        where: { email: data.email },
        select: SelectUser,
      });
    } else {
      // create user to database
      userDB = await this.prisma.users.create({
        data: { ...data, password: hashedPassword },
        select: SelectUser,
      });
    }

    const { username, user_role, user_uid, email, image_uri } = userDB;
    // generate token
    const token = this.jwtService.signToken({
      username,
      user_role,
      user_uid,
      email,
      image_uri,
    });

    // send token from email
    this.emailService.sendEmail(email, token);

    // send response user
    return { ...userDB };
  }

  async signInUser(
    data: Partial<users>,
  ): Promise<{ user: Partial<users>; token: string }> {
    // find user
    let user: users;
    try {
      user = await this.prisma.users.findUnique({
        where: { email: data.email },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Email not found');
      } else throw new InternalServerErrorException();
    }

    if (!user || user.oauth === true)
      throw new NotFoundException('User Not Found');

    const { user_role, username, email, user_uid, password, image_uri } = user;
    // check password
    const comparePassword = await bcrypt.compare(
      data.password as string,
      password,
    );
    if (!comparePassword) {
      throw new UnauthorizedException('Wrong credential');
    }

    // generate token
    const token = this.jwtService.signToken({
      username,
      email,
      user_role,
      user_uid,
      image_uri,
    });

    // is account confirmed?
    if (!user.confirmed)
      throw new UnauthorizedException('Account not confirmed', token);

    // return user
    return { user, token };
  }

  async confirmationUser(token: string) {
    const { decodedToken, decodedFailed } = this.jwtService.decodeToken(token);
    if (decodedFailed) throw new UnauthorizedException();

    const { user_uid } = decodedToken;

    // find user and change confirmed to true
    return this.prisma.users.update({
      where: { user_uid },
      select: SelectUser,
      data: { confirmed: true },
    });
  }

  async resendEmail(token: string) {
    // check is valid token
    const { decodedFailed, decodedToken } = this.jwtService.decodeToken(token);
    if (decodedFailed) throw new UnauthorizedException();

    // resend token to email
    this.emailService.sendEmail(decodedToken.email, token);
    return { success: true };
  }

  async deleteUser(user_uid: string) {
    // find user in database and delete
    try {
      return await this.prisma.users.delete({
        where: { user_uid },
        select: SelectUser,
      });
    } catch (err) {
      throw new NotFoundException('User Not Found');
    }
  }

  async updateUser(
    data: Prisma.usersUpdateInput,
    userWhereUniqueInput: Prisma.usersWhereUniqueInput,
    imageFile: Express.Multer.File,
  ): Promise<users> {
    let user: users;
    try {
      user = imageFile
        ? await this.prisma.users.update({
            where: userWhereUniqueInput,
            data: { ...data, image_uri: imageFile.filename },
          })
        : await this.prisma.users.update({
            where: userWhereUniqueInput,
            data,
          });
    } catch (err) {
      console.log(err);
      if (err instanceof Prisma.PrismaClientKnownRequestError)
        throw new ConflictException('Username or email already exist');
      throw new InternalServerErrorException();
    }
    return user;
  }

  async readNotificationTrue(notification_uid: string, read: boolean) {
    let notification: notifications;
    try {
      notification = await this.prisma.notifications.update({
        data: { read },
        where: { notification_uid },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException('Notification not found');
      }
      throw new InternalServerErrorException();
    }
    return notification;
  }

  async googleOAuthService(code: string) {
    const { access_token } = await this.httpService
      .post(`https://oauth2.googleapis.com/token`, {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.OAUTH_REDIRECT,
        grant_type: 'authorization_code',
        code,
      })
      .toPromise()
      .then((res) => res.data)
      .catch((err) => {
        throw new InternalServerErrorException(err.response);
      });

    if (!access_token) throw new ForbiddenException();

    const { user } = await this.httpService // e.g {id,email, name, given_name, family_name, picture, locale}
      .get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .toPromise()
      .then((res) => res.data)
      .catch((err) => {
        throw new InternalServerErrorException(err.response);
      });

    if (!user) throw new ForbiddenException();
    console.log(user);

    // generate token
    const { email, name, picture } = user;

    // check is user already signup
    const isUserInDB = await this.prisma.users.findUnique({
      where: { email },
    });

    if (isUserInDB && isUserInDB.oauth === false) {
      throw new ForbiddenException(
        "It's seem you already registered, better for signin",
      );
    }

    // if user not in DB and create that in db
    let userDB: Partial<users>;
    if (!isUserInDB) {
      // generate password
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(name, salt);

      // save to db with oauth true
      userDB = await this.prisma.users.create({
        data: {
          username: name,
          email,
          oauth: true,
          password,
          image_uri: picture,
        },
        select: SelectUser,
      });
    }

    // generate token
    const {
      username,
      user_role,
      user_uid,
      email: emailUserDB,
      image_uri,
    } = userDB;

    const token = this.jwtService.signToken({
      username,
      user_role,
      user_uid,
      email: emailUserDB,
      image_uri,
    });

    return { token, user }; // e.g {id,email, name, given_name, family_name, picture, locale}
  }
}
