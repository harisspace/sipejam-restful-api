import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { JwtService } from './services/jwt.service';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';

const codeOAuth2 = 'fdfsfjdjjj';

describe('UserController', () => {
  let controller: UserController;

  const userTest = {
    id: 1,
    user_uid: 'testUid',
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
      .mockImplementation((params: { where; take; include; orderBy? }) => [
        notificationReturnTest,
      ]),
    createUser: jest.fn().mockImplementation((dto) => ({
      id: Date.now(),
      user_uid: Date.now(),
      ...dto,
      created_at: Date.now(),
      updated_at: Date.now(),
    })),
    signInUser: jest.fn().mockImplementation((dto) => ({
      user: {
        id: Date.now(),
        user_uid: Date.now(),
        ...dto,
        created_at: Date.now(),
        updated_at: Date.now(),
      },
      token,
    })),
    deleteUser: jest.fn().mockImplementation(() => userTest),
    updateUser: jest
      .fn()
      .mockImplementation((where, data) => ({ ...data, ...userTest })),
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

    it('should return notifications', async () => {
      const user_uid = 'testToUid';
      expect(await controller.getUserNotification(user_uid)).toEqual([
        {
          ...notificationReturnTest,
          to_uid: user_uid,
        },
      ]);

      expect(mockUserService.getUserNotification).toHaveBeenCalledWith({
        where: { to_uid: user_uid, read: false },
        take: 20,
        orderBy: { created_at: 'desc' },
        include: { users_notifications_from_uidTousers: true },
      });
    });
  });

  describe('POST Method', () => {
    it('should create user', async () => {
      const dto = {
        username: 'harisakbar',
        email: 'harisakbar04@gmail.com',
        password: 'test12',
      };
      expect(controller.createUser(dto)).toEqual({
        id: expect.any(Number),
        user_uid: expect.any(Number),
        ...dto,
        created_at: expect.any(Number),
        updated_at: expect.any(Number),
      });
      expect(mockUserService.createUser).toHaveBeenCalledWith(dto);
    });

    it('should find user exist and match password and set cookie token', async () => {
      const dto = {
        email: 'harisakbar04@gmail.com',
        password: 'test12',
      };
      const mockResponse: any = {
        cookie: jest.fn(() => ({})),
      };
      expect(await controller.signInUser(mockResponse, dto)).toEqual({
        id: expect.any(Number),
        user_uid: expect.any(Number),
        ...dto,
        created_at: expect.any(Number),
        updated_at: expect.any(Number),
      });

      expect(mockUserService.signInUser).toHaveBeenCalledWith(dto);
    });

    it('should be set cookie maxAge to expired', () => {
      const mockResponse: any = {
        cookie: jest.fn().mockImplementation(() => ({})),
      };
      expect(controller.signOutUser(mockResponse)).toEqual({ success: true });
    });
  });

  describe('DELETE Method', () => {
    it('should be delete user', async () => {
      const user_uid = 'testUid';
      expect(await controller.deleteUser(user_uid)).toEqual(userTest);
    });
  });

  describe('PATCH Method', () => {
    const user_uid = 'testUid';
    const dto = {
      username: 'budi',
      email: 'budi@gmail.com',
    };
    it('should update user', async () => {
      expect(await controller.updateUser(user_uid, dto)).toEqual(userTest);
    });
  });
});
