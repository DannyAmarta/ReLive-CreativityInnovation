import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserLoader } from './user.loader';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserController } from './user.controller'; // Import the controller
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('JWT_EXPIRES_IN') as any,
        },
      }),
    }),
    MailerModule,
    // Configure Multer for local storage
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  ],
  controllers: [UserController], // Register the controller here
  providers: [UserResolver, UserService, PrismaService, UserLoader],
})
export class UserModule {}