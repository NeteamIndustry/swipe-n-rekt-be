import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['https://app.mailry.co', 'http://localhost:3000', '*'], // Your frontend URL (explicitly mention it, NOT '*')
    credentials: true, // Allow credentials (cookies)
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
