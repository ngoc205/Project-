import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CanBoController } from './can-bo.controller';
import { CanBoService } from './can-bo.service';
import { CanBo } from './entities/can-bo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CanBo])],
  controllers: [CanBoController],
  providers: [CanBoService],
})
export class CanBoModule {}
