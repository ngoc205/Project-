import { Module } from '@nestjs/common';
import { GiaovienController } from './giaovien.controller';
import { GiaovienService } from './giaovien.service';

@Module({
  controllers: [GiaovienController],
  providers: [GiaovienService],
  exports: [GiaovienService],
})
export class GiaovienModule {}