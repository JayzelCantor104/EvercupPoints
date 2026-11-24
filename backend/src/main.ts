import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // api versioning (lab 05)
  app.setGlobalPrefix('api/v1');

  // validate request bodies with the DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // same error format everywhere
  app.useGlobalFilters(new HttpExceptionFilter());

  // allow the react app (runs on another port)
  app.enableCors({ origin: true, credentials: true });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`EvercupPoints API running on http://localhost:${port}/api/v1`);
}
bootstrap();
