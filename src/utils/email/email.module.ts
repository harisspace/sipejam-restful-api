import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          pool: true,
          host: 'smtp.gmail.com',
          service: 'gmail',
          secure: true,
          port: 465,
          auth: {
            type: 'OAuth2',
            user: process.env.HOST_EMAIL,
          },
        },
        defaults: {
          from: '"no-reply" <sipejamunand.com>',
        },
      }),
    }),
  ],
})
export class EmailModule {}
