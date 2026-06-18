import { Module } from '@nestjs/common';
import { ThoiKhoaBieuController } from './thoi-khoa-bieu.controller';
import { ThoiKhoaBieuService } from './thoi-khoa-bieu.service';

@Module({
  controllers: [ThoiKhoaBieuController],
  providers: [ThoiKhoaBieuService],
})
export class ThoiKhoaBieuModule {}
