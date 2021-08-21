import { HttpService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from './jwt.service';
import { MailService } from './mail.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        PrismaService,
        HttpService,
        MailService,
        JwtService,
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get specific user detail', async () => {
    const user_uid = 'jdjkfsj';
    // expect(await service.getUser({ user_uid })).toEqual(user);
  });
});
