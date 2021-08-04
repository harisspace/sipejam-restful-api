import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { request } from 'express';
import { PrismaService } from '../prisma.service';
import { JwtService } from './services/jwt.service';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';

const codeOAuth2 = 'fdfsfjdjjj';

describe('UserController', () => {
  let controller: UserController;

  const userTest = {
    id: 1,
    user_uid: 'testuid',
    username: 'Haris Akbar',
    email: 'harisakbar04@gmail.com',
    user_role: 'user',
    image_uri: 'dfsdfjl.jpg',
    confirmed: true,
    created_at: 'testtime',
    updated_at: 'testtime',
  };

  const notificationReturnTest = {
    id: 1,
    title: 'notifTitle',
    message: 'hello',
    read: true,
    to_uid: 'testToUid',
    from_uid: 'testFromUid',
    created_at: 'testtime',
    updated_at: 'testtime',
  };

  const token = 'testToken';

  const mockUserService = {
    getUsers: jest.fn().mockImplementation(() => [userTest]),
    getUser: jest
      .fn()
      .mockImplementation(({ user_uid }: { user_uid: string }) => ({
        user_uid,
        ...userTest,
      })),
    googleOAuthService: jest.fn().mockImplementation((code: string) => ({
      user: userTest,
      token,
    })),
    confirmationUser: jest.fn().mockImplementation((token: string) => userTest),
    resendEmail: jest.fn().mockImplementation((token: string) => ({
      success: true,
    })),
    getUserNotification: jest
      .fn()
      .mockImplementation(
        (params: { where; take; include; orderBy? }) => notificationReturnTest,
      ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, ConfigService, JwtService, PrismaService],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  describe('GET Method', () => {
    it('should be return array of user', async () => {
      expect(await controller.getUsers()).toEqual([userTest]);
    });

    it('should be return user', async () => {
      const user_uid = '1';
      expect(await controller.getSpecificUser(user_uid)).toEqual(userTest);
    });

    it('should be set cookie and return user and token', async () => {
      const mockResponse: any = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        cookie: jest.fn().mockImplementation(() => {}),
      };

      expect(await controller.googleOAuth(codeOAuth2, mockResponse)).toEqual({
        user: userTest,
        token,
      });

      expect(mockUserService.googleOAuthService).toHaveBeenCalledWith(
        codeOAuth2,
      );
    });

    it('should return user by passing token', async () => {
      expect(await controller.confirmationUser(token)).toEqual(userTest);

      expect(mockUserService.confirmationUser).toHaveBeenCalledWith(token);
    });

    it('should send email and return success', async () => {
      expect(await controller.resendEmail(token)).toEqual({ success: true });
    });

    it('should return notification', async () => {
      const user_uid = 'testToUid';
      expect(await controller.getUserNotification(user_uid)).toEqual({
        ...notificationReturnTest,
        to_uid: user_uid,
      });

      expect(mockUserService.getUserNotification).toHaveBeenCalledWith({
        where: { to_uid: user_uid, read: false },
        take: 20,
        orderBy: { created_at: 'desc' },
        include: { users_notifications_from_uidTousers: true },
      });
    });

    // it('should return user', () => {
    //   const mockRequest = jest.fn().mockImplementation(() => userTest);
    //   expect(controller.isUserLogin(mockRequest)).toEqual(userTest);
    // });
  });

  describe('POST Method', () => {
    it('should set cookie maxAge to expired', () => {
      const mockResponse: any = {
        cookie: jest.fn().mockImplementation(() => ({ success: true })),
      };
      expect(controller.signOutUser(mockResponse)).toEqual({ success: true });
    });
  });

  // it('shoud')
});
