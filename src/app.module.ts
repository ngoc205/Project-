import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CanBoModule } from './can-bo/can-bo.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'DESKTOP-UUCAGSG',
      port: 1433,
      username: 'sa',
      password: '123456Aa@',
      database: 'QuanLyTruongTieuHoc',
      options: {
        trustServerCertificate: true,
        encrypt: false,
      },
      synchronize: true,
      autoLoadEntities: true,
    }),

    CanBoModule,
  ],
})
export class AppModule {}