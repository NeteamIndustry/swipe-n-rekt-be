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

  const allowedOrigins = [
    'http://localhost:3000',
    'https://swipenrekt.vercel.app',
  ];
  const vercelPreviewOrigin = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        vercelPreviewOrigin.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
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
