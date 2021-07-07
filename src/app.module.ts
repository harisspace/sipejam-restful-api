import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import configuration from './config/configuration';
import { EventsModule } from './events/events.module';
import { SystemModule } from './system/system.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    SystemModule,
    EventsModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/v1*'],
    }),
    MailerModule.forRoot({
      transport: {
        pool: true,
        host: 'smtp.gmail.com',
        service: 'gmail',
        port: 465,
        auth: {
          user: process.env.HOST_EMAIL,
          pass: process.env.HOST_EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
    }),
  ],
})
export class AppModule {}
