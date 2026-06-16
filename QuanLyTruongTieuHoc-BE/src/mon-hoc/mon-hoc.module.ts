import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonHoc } from './mon-hoc.entity';
import { MonHocService } from './mon-hoc.service';
import { MonHocController } from './mon-hoc.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MonHoc])],
  controllers: [MonHocController],
  providers: [MonHocService],
})
export class MonHocModule {}