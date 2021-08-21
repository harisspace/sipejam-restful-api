import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { OAuth2Service } from './oauth2.service';

@Injectable()
export class MailService {
  private transporter: Transporter;
  constructor(
    private readonly oauth2Service: OAuth2Service,
    private readonly configService: ConfigService,
  ) {}

  async createTransport() {
    const accessToken: any =
      await this.oauth2Service.getAccessTokenByRefreshToken();

    this.transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: this.configService.get<string>('HOST_EMAIL'),
        accessToken,
      },
    });
  }

  async sendEmail(destination: string, token: string) {
    await this.createTransport();
    this.transporter.sendMail({
      to: destination,
      from: this.configService.get<string>('HOST_EMAIL'),
      subject: 'Confirmation Account',
      text: 'hello please confirm your account',
      html: `<div>
                  <h1>Please click this <a href=${this.configService.get<string>(
                    'CLIENT_DOMAIN',
                  )}/auth/confirmation/${token}>link</a> to verify your account</h1>
                </div>`,
    });
  }
}
