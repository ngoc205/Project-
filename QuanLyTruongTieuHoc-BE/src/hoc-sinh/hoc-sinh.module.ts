import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HocSinhController } from './hoc-sinh.controller';
import { HocSinhService } from './hoc-sinh.service';
import { HocSinh } from './entities/hoc-sinh.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HocSinh,
    ]),
  ],
  controllers: [HocSinhController],
  providers: [HocSinhService],
})
export class HocSinhModule {}