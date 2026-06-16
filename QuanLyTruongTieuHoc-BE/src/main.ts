// File: src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Dòng "chìa khóa" bắt buộc phải nằm ở đây:
  app.enableCors({
    origin: '*', // Cho phép mọi nguồn truy cập (hoặc bạn có thể chỉ định 'http://localhost:5173')
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();