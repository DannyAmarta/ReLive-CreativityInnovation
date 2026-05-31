import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthResolver } from './auth.resolver';
import { GoogleStrategy } from './startegies/google.stratey';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './startegies/jwt.strategy';
import { RedisService } from '../core/redis.service';

@Module({
  imports: [
    PrismaModule,
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
    GoogleStrategy,
    JwtStrategy,
    RedisService,
  ],
  controllers: [AuthController],
  exports: [AuthService, RedisService],
})
export class AuthModule {}
