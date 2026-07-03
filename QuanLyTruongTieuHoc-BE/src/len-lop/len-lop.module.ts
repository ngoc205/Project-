import { Module } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { LenLopController } from './len-lop.controller';
import { LenLopService } from './len-lop.service';

@Module({ controllers: [LenLopController], providers: [LenLopService, RolesGuard] })
export class LenLopModule {}
