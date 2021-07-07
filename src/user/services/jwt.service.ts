import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private decodedToken: any;
  private decodedFailed: any;
  private token: string;
  constructor(private configService: ConfigService) {}

  signToken(payload: {
    username: string;
    user_uid: string;
    email: string;
    user_role: string;
    image_uri: string;
  }): string {
    this.token = jwt.sign(
      payload,
      this.configService.get<string>('JWT_SECRET'),
    );
    return this.token;
  }

  decodeToken(token: string) {
    try {
      this.decodedToken = jwt.verify(
        token,
        this.configService.get<string>('JWT_SECRET'),
      );
    } catch (err) {
      this.decodedFailed = err;
    }
    return {
      decodedToken: this.decodedToken,
      decodedFailed: this.decodedFailed,
    };
  }
}
