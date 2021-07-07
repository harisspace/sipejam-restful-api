import { MailerService } from '@nestjs-modules/mailer';
import { RequestTimeoutException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  sendEmail(destination: string, token: string) {
    this.mailerService
      .sendMail({
        to: destination,
        from: this.configService.get<string>('HOST_EMAIL'),
        subject: 'Confirmation Account',
        text: 'hello',
        html: `<div>
                  <h1>Please click this <a href=${this.configService.get<string>(
                    'CLIENT_DOMAIN',
                  )}/auth/confirmation/${token}>link</a> to verify your account</h1>
                </div>`,
      })
      .then(() => console.log('Email has been sent'))
      .catch(() => new RequestTimeoutException());
  }
}
