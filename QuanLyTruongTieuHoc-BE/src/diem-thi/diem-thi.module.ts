import { Module } from '@nestjs/common';
import { DiemThiController } from './diem-thi.controller';
import { DiemThiService } from './diem-thi.service';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  controllers: [DiemThiController],
  providers: [DiemThiService, RolesGuard],
})
export class DiemThiModule {}
