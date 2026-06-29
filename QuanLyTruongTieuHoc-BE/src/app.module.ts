import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module'; 
import { MonHocModule } from './mon-hoc/mon-hoc.module';
import { GiaovienModule } from './giaovien/giaovien.module';
<<<<<<< Updated upstream

=======
import { CanBoModule } from './can-bo/can-bo.module';
import { HocSinhModule } from './hoc-sinh/hoc-sinh.module';
import { UploadModule } from './upload/upload.module';
import { DiemModule } from './diem/diem.module';
>>>>>>> Stashed changes

@Module({
  imports: [
    TypeOrmModule.forRoot({
<<<<<<< Updated upstream
  type: 'mssql',
  host: 'localhost',
  port: 1433,
  username: 'sa',
  password: '123', 
  database: 'PriSchool',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  options: {
    encrypt: false, // Tắt mã hóa nếu chạy local
    trustServerCertificate: true, // Thêm dòng này để kết nối không bị chặn chứng chỉ local
  },
}),
=======
      type: 'mssql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 1433),
      username: process.env.DB_USERNAME || 'sa',
      password: process.env.DB_PASSWORD || '123',
      database: process.env.DB_DATABASE || 'PriSchool',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),
>>>>>>> Stashed changes
    AuthModule,
    MonHocModule,
    GiaovienModule,
<<<<<<< Updated upstream
=======
    CanBoModule,
    HocSinhModule,
    UploadModule,
    DiemModule,
>>>>>>> Stashed changes
  ],
})
export class AppModule {}