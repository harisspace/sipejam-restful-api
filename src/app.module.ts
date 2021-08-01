import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import configuration from './config/configuration';
import { EventsModule } from './events/events.module';
import { SystemModule } from './system/system.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './utils/email/email.module';
import { OAuth2Module } from './utils/OAuth2/oauth2.module';

@Module({
  imports: [
    UserModule,
    SystemModule,
    EventsModule,
    EmailModule,
    OAuth2Module,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/v1*'],
    }),
  ],
})
export class AppModule {}
