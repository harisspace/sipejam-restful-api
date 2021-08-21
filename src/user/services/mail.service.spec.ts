import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { OAuth2Service } from './oauth2.service';

describe('MAIL SERVICE', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OAuth2Service, ConfigService, MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should create transport email configuration', () => {
    expect(service.createTransport()).toBeDefined();
  });

  it('should send email', () => {
    const destinationEmail = 'harisakbar04@gmail.com';
    const token = 'thisistoken';
    expect(service.sendEmail(destinationEmail, token)).toBeDefined();
  });
});
