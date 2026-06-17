import { Module } from '@nestjs/common';
import { LopHocController } from './lop-hoc.controller';
import { LopHocService } from './lop-hoc.service';

@Module({
  controllers: [LopHocController],
  providers: [LopHocService],
})
export class LopHocModule {}
