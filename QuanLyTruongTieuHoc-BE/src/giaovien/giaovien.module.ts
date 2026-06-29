import { Module } from '@nestjs/common';
import { GiaovienController } from './giaovien.controller';
import { GiaovienService } from './giaovien.service';
import { HocSinhModule } from 'src/hoc-sinh/hoc-sinh.module';

@Module({
  imports: [
    HocSinhModule // <--- Chỉ giữ lại import này
  ],
  controllers: [GiaovienController],
  providers: [GiaovienService],
  exports: [GiaovienService],
})
export class GiaovienModule {}