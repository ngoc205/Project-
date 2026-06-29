import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MonHocModule } from './mon-hoc/mon-hoc.module';
import { LopHocModule } from './lop-hoc/lop-hoc.module';
import { ThoiKhoaBieuModule } from './thoi-khoa-bieu/thoi-khoa-bieu.module';
import { GiaovienModule } from './giaovien/giaovien.module';
import { CanBoModule } from './can-bo/can-bo.module';
import { HocSinhModule } from './hoc-sinh/hoc-sinh.module';
import { UploadModule } from './upload/upload.module';
import { LenLopModule } from './len-lop/len-lop.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 1433),
      username: process.env.DB_USERNAME || 'sa',
      password: process.env.DB_PASSWORD || '123456Aa@',
      database: process.env.DB_DATABASE || 'PriSchool',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),
    AuthModule,
    MonHocModule,
    LopHocModule,
    ThoiKhoaBieuModule,
    GiaovienModule,
    CanBoModule,
    HocSinhModule,
    UploadModule,
    LenLopModule,
  ],
})
export class AppModule {}
