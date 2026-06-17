import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CanBoController } from './can-bo.controller';
import { CanBoService } from './can-bo.service';

import { CanBo } from './entities/can-bo.entity';
import { TaiKhoan } from '../auth/tai-khoan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CanBo,
      TaiKhoan,
    ]),
  ],
  controllers: [CanBoController],
  providers: [CanBoService],
  exports: [CanBoService],
})
export class CanBoModule {}