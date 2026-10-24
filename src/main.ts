
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // تفعيل فلتر معالجة الأخطاء على مستوى التطبيق
  app.useGlobalFilters(new HttpExceptionFilter());

  // التحقق من البيانات المرسلة في جميع الطلبات
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,

      // إرجاع رسائل واضحة عند فشل التحقق
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((error) =>
          Object.values(error.constraints ?? {}),
        );

        return new BadRequestException({
          statusCode: 400,
          message: messages,
          error: 'Bad Request',
        });
      },
    }),
  );

  // إعداد توثيق Swagger
  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription(
      'API for managing users, authentication, and tasks',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // عرض توثيق API على المسار /api/docs
  SwaggerModule.setup('api/docs', app, document);

  // تشغيل التطبيق على المنفذ المحدد أو 3000 افتراضياً
  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation: ${await app.getUrl()}/api/docs`);
}

// معالجة أخطاء بدء تشغيل التطبيق
bootstrap().catch((error: unknown) => {
  console.error('Failed to start application:', error);
  process.exitCode = 1;
});
