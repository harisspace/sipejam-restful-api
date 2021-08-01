import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

@Injectable()
export class OAuth2Service {
  private OAuth2Client: OAuth2Client;
  constructor(private readonly configService: ConfigService) {
    this.OAuth2Client = new google.auth.OAuth2({
      clientId: this.configService.get<string>('CLIENT_ID'),
      clientSecret: this.configService.get<string>('CLIENT_SECRET'),
      redirectUri: this.configService.get<string>('OAUTH_REDIRECT'),
    });
  }

  setCredential() {
    this.OAuth2Client.setCredentials({
      refresh_token: this.configService.get<string>('REFRESH_TOKEN'),
    });
  }

  async getAccessTokenByRefreshToken() {
    this.setCredential();
    try {
      return await this.OAuth2Client.getAccessToken();
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
