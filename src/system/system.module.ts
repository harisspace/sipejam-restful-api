import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from 'src/user/services/jwt.service';
import { HelperService } from './services/helper.service';
import { SystemService } from './services/system.service';
import { SystemController } from './system.controller';
import { MulterModule } from '@nestjs/platform-express';
import { makeid } from '../helper/makeId';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  controllers: [SystemController],
  providers: [SystemService, PrismaService, JwtService, HelperService],
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        storage: diskStorage({
          destination: function (_, __, cb) {
            cb(null, './client/images');
          },
          filename: function (_, file, cb) {
            const name = makeid(4);
            cb(null, name + Date.now() + extname(file.originalname)); // e.g hsdfsfj323423 + .jpg
          },
        }),
      }),
    }),
  ],
})
export class SystemModule {}
