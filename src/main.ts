import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Swipe N Rekt API')
    .setDescription('API documentation for Swipe N Rekt backend')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const openApiDocument = SwaggerModule.createDocument(app, swaggerConfig);

  app.use(
    '/docs',
    apiReference({
      content: openApiDocument,
      pageTitle: 'Swipe N Rekt API Docs',
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
