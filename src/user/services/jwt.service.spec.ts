import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from './jwt.service';

describe('JWT SERVICE', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtService, ConfigService],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should sign/create token based on payload', () => {
    const payload = {
      username: 'haris',
      user_uid: 'testUid',
      email: 'harisakbar04@gmail.com',
      user_role: 'superadmin',
      image_uri: 'jfjdkjklj.jpg',
    };

    expect(service.signToken(payload)).toBeDefined();
  });

  it('should decoded token based on token', () => {
    const token = 'initesttoken';

    expect(service.decodeToken(token)).toBeDefined();
  });
});
