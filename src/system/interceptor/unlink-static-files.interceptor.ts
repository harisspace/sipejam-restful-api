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

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const fileImage = request.file;
    const { system_uid } = request.params;
    console.log(fileImage);
    if (fileImage) {
      const system = await this.prisma.systems.findUnique({
        where: { system_uid },
      });
      console.log(system);
      fs.unlink(
        join(process.cwd(), 'client', 'images', system.image_uri),
        (err) => {
          if (err) throw new InternalServerErrorException();
          console.log('image deleted');
        },
      );
    }
    console.log('before ...');

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`after ... ${Date.now() - now}ms`)));
  }
}
