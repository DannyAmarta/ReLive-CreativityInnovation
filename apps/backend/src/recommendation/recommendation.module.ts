import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RecommendationResolver } from './recommendation.resolver';
import { RecommendationService } from './recommendation.service';
import { SetModule } from '../set/set.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    SetModule,
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
  ],
  controllers: [],
  providers: [RecommendationService, RecommendationResolver],
  exports: [RecommendationService],
})
export class RecommendationModule {}
