import { Module } from '@nestjs/common';
import { DiemService } from './diem.service';
import { DiemController } from './diem.controller';
import { DiemThi } from './entities/diem-thi.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([DiemThi])],
  providers: [DiemService],
  controllers: [DiemController]
})
export class DiemModule {}
