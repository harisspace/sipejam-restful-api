import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

@Injectable()
export class OAuth2Service {
  private OAuth2Client: OAuth2Client;
  constructor(private readonly configService: ConfigService) {
    this.OAuth2Client = new google.auth.OAuth2({
      clientId: this.configService.get<string>('CLIENT_ID_EMAIL'),
      clientSecret: this.configService.get<string>('CLIENT_SECRET_EMAIL'),
      redirectUri: this.configService.get<string>('OAUTH_REDIRECT_EMAIL'),
    });
  }

  setCredential() {
    this.OAuth2Client.setCredentials({
      refresh_token: this.configService.get<string>('REFRESH_TOKEN'),
    });
  }

  getAccessTokenByRefreshToken() {
    this.setCredential();
    return this.OAuth2Client.getAccessToken()
      .then((res) => res.token)
      .catch((err) => {
        console.log(err);
      });
  }
}
