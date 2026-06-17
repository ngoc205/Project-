import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MonHocModule } from './mon-hoc/mon-hoc.module';
import { LopHocModule } from './lop-hoc/lop-hoc.module';
import { ThoiKhoaBieuModule } from './thoi-khoa-bieu/thoi-khoa-bieu.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: 'Thuong@0702',
      database: 'PriSchool',
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
  ],
})
export class AppModule {}
