import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { MonHocModule } from './mon-hoc/mon-hoc.module';
import { GiaovienModule } from './giaovien/giaovien.module';
import { CanBoModule } from './can-bo/can-bo.module';
import { HocSinhModule } from './hoc-sinh/hoc-sinh.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: '123456Aa@',
      database: 'PriSchool',

      entities: [__dirname + '/**/*.entity{.ts,.js}'],

      synchronize: false,

      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),

    AuthModule,
    MonHocModule,
    GiaovienModule,
    CanBoModule,
    HocSinhModule, // <- thêm dòng này
  ],
})
export class AppModule {}