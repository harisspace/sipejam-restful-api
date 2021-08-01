import { Module } from '@nestjs/common';
import { OAuth2Service } from './oauth2.service';

@Module({
  providers: [OAuth2Service],
})
export class OAuth2Module {}
