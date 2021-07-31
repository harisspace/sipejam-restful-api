import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from 'src/prisma.service';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class UnlinkStaticFilesInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  unlinkStaticFileSystem(system_image_path: string) {
    try {
      fs.unlink(
        join(process.cwd(), 'client', 'images', system_image_path),
        (err) => {
          if (err) throw new InternalServerErrorException();
          console.log('image deleted');
        },
      );
    } catch (err) {
      return;
    }
  }

  unlinkStaticFileUser(user_image_path: string) {
    if (user_image_path === 'user.jpg') return;

    try {
      fs.unlink(
        join(process.cwd(), 'client', 'images', user_image_path),
        (err) => {
          if (err) throw new InternalServerErrorException();
          console.log('image deleted');
        },
      );
    } catch (err) {
      return;
    }
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const fileImage = request.file;
    const { system_uid, user_uid } = request.params;
    console.log(system_uid, user_uid, request.method);
    if (system_uid) {
      // if update system and have file image
      if (fileImage) {
        const { image_uri } = await this.prisma.systems.findUnique({
          where: { system_uid },
          select: { image_uri: true },
        });
        this.unlinkStaticFileSystem(image_uri);
      }

      if (request.method === 'DELETE') {
        const { image_uri } = await this.prisma.systems.findUnique({
          where: { system_uid },
          select: { image_uri: true },
        });
        this.unlinkStaticFileSystem(image_uri);
      }
    }

    if (user_uid) {
      if (fileImage) {
        const { image_uri } = await this.prisma.users.findUnique({
          where: { user_uid },
          select: { image_uri: true },
        });
        this.unlinkStaticFileUser(image_uri);
      }

      if (request.method == 'DELETE') {
        const { image_uri } = await this.prisma.users.findUnique({
          where: { user_uid },
          select: { image_uri: true },
        });
        this.unlinkStaticFileUser(image_uri);
      }
    }

    console.log('before ...');

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`after ... ${Date.now() - now}ms`)));
  }
}
