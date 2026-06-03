import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { FoodModule } from './food/food.module';
import { RecipeModule } from './recipe/recipe.module';
import Redis from 'ioredis';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GqlThrottlerGuard } from './core/guards/gql-throttler.guard';
import { DataLoaderInterceptor } from 'nestjs-dataloader';
import { SetModule } from './set/set.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { ChatModule } from './chat/chat.module';
import { TrainerModule } from './trainer/trainer.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { MessagingModule } from './messaging/messaging.module';
import { FiatPaymentModule } from './fiat-payment/fiat-payment.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
        },
      }),
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const client = new Redis(
          configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
        );
        let lastErrorLoggedAt = 0;
        client.on('error', (err) => {
          const now = Date.now();
          if (now - lastErrorLoggedAt > 30000) {
            lastErrorLoggedAt = now;
            console.error('Throttler Redis Connection Error:', err.message || 'Connection refused. Retrying in background...');
          }
        });
        return {
          throttlers: [
            {
              name: 'default',
              ttl: 60000, // 1 minute
              limit: 150,
            },
          ],
          storage: new ThrottlerStorageRedisService(client),
        };
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      context: ({ req, res }) => ({ req, res }),
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    FoodModule,
    RecipeModule,
    SetModule,
    RecommendationModule,
    ChatModule,
    TrainerModule,
    BlockchainModule,
    FiatPaymentModule,
    MessagingModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
  ],
})
export class AppModule {}
