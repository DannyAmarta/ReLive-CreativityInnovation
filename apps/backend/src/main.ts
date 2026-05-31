import './instrumentation';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; // 1. Add this
import { join } from 'path'; // 2. Add this

async function bootstrap() {
  // 3. Add <NestExpressApplication> here
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  const frontendUrl =
    process.env.FRONTEND_URL ??
    process.env.APP_FRONTEND_URL ??
    'http://localhost:3000';

  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // 4. Tell Nest to serve the uploads folder publicly
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/', 
  });

  // Fix #11: whitelist strips unknown properties; forbidNonWhitelisted rejects requests with extra fields
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen(8000);
}

bootstrap();