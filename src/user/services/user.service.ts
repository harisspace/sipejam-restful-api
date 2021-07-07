import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, users } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { SelectUser } from '../../interface/user.interface';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from './jwt.service';
import { EmailService } from './email.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private emailService: EmailService,
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

  async createUser(data: Prisma.usersCreateInput): Promise<Partial<users>> {
    // find unique constrain is already registered or not
    const user = await this.prisma.users.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });

    if (user) {
      throw new BadRequestException('Username or Email is already registered');
    }

    // hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // create user to database
    const createdUser = await this.prisma.users.create({
      data: { ...data, password: hashedPassword },
      select: SelectUser,
    });

    const { username, user_role, user_uid, email, image_uri } = createdUser;
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
    return { ...createdUser };
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

    if (!user) throw new NotFoundException('User Not Found');

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
}
