import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DiemThiService } from './diem-thi.service';

@Controller('api/diem-thi')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CanBo')
export class DiemThiController {
  constructor(private readonly diemThiService: DiemThiService) {}

  @Get('options')
  getOptions() {
    return this.diemThiService.getOptions();
  }

  @Get()
  getGradebook(@Query('lopId') lopId?: string, @Query('monHocId') monHocId?: string) {
    return this.diemThiService.getGradebook(lopId ? Number(lopId) : undefined, monHocId ? Number(monHocId) : undefined);
  }

  @Put()
  saveGradebook(@Body() body: Parameters<DiemThiService['saveGradebook']>[0]) {
    return this.diemThiService.saveGradebook(body);
  }
}
