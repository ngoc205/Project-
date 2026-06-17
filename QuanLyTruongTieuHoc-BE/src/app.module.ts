import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MonHocModule } from './mon-hoc/mon-hoc.module';
import { LopHocModule } from './lop-hoc/lop-hoc.module';
import { ThoiKhoaBieuModule } from './thoi-khoa-bieu/thoi-khoa-bieu.module';
import { GiaovienModule } from './giaovien/giaovien.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 1433),
      username: process.env.DB_USERNAME || 'sa',
      password: process.env.DB_PASSWORD || 'Thuong@0702',
      database: process.env.DB_DATABASE || 'PriSchool',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      options: {
        encrypt: false, // Tắt mã hóa nếu chạy local
        trustServerCertificate: true, // Thêm dòng này để kết nối không bị chặn chứng chỉ local
      },
    }),
    AuthModule,
    MonHocModule,
    LopHocModule,
    ThoiKhoaBieuModule,
    GiaovienModule,
  ],
})
export class AppModule {}
