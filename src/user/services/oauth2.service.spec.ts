import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OAuth2Service } from './oauth2.service';

describe('OAUTH2 SERVICE', () => {
  let service: OAuth2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OAuth2Service, ConfigService],
    }).compile();

    service = module.get<OAuth2Service>(OAuth2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set credentials', () => {
    expect(service.setCredential()).toBeUndefined();
  });

  it('should get access token by refresh token', async () => {
    expect(await service.getAccessTokenByRefreshToken()).toBeUndefined();
  });
});
