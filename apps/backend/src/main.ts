import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "http://localhost:3000",
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe())
  await app.listen(8000);
}
bootstrap();
