import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthResolver } from './auth.resolver';
import { GoogleStrategy } from './startegies/google.stratey';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './startegies/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('JWT_EXPIRES_IN') as any,
        },
      }),
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    PrismaService,
    GoogleStrategy,
    JwtStrategy,
  ],
  controllers: [AuthController]
})
export class AuthModule {}
