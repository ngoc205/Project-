import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MonHocModule } from './mon-hoc/mon-hoc.module';
import { TaiKhoan } from './auth/tai-khoan.entity';
import { MonHoc } from './mon-hoc/mon-hoc.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: '127.0.0.1',
      port: 1433,
      username: 'sa',
      password: '123456Aa@', 
      database: 'QL_TruongTieuHoc_LacLongQuan',
      entities: [TaiKhoan, MonHoc],
      synchronize: false,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),
    AuthModule,
    MonHocModule,
  ],
})
export class AppModule {}