import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// This bootstrap function configures the backend entry point.
// It is used once at startup to enforce validation and keep CORS limited to the frontend origin.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl =
    process.env.FRONTEND_URL ??
    process.env.APP_FRONTEND_URL ??
    'http://localhost:3000';

  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(8000);
}

bootstrap();
