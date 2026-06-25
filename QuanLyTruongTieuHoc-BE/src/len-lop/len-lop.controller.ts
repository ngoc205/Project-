import { BadRequestException, Body, Controller, Get, HttpException, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { LenLopService } from './len-lop.service';

@Controller('api/len-lop')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CanBo')
export class LenLopController {
  constructor(private readonly lenLopService: LenLopService) {}

  @Get('options') options() { return this.lenLopService.getOptions(); }
  @Get('preview')
  async preview(@Query('sourceThoiGianId') source: string, @Query('targetThoiGianId') target: string) {
    try {
      return await this.lenLopService.preview(Number(source), Number(target));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Lỗi xem trước lên lớp:', error);
      throw new BadRequestException(error instanceof Error ? error.message : 'Không thể xem trước dữ liệu lên lớp.');
    }
  }
  @Post('tao-nam-hoc') createNextSchoolYear(@Body() body: { sourceThoiGianId?: number }) { return this.lenLopService.createNextSchoolYear(Number(body.sourceThoiGianId)); }
  @Post() promote(@Body() body: { sourceThoiGianId?: number; targetThoiGianId?: number }) { return this.lenLopService.promote(Number(body.sourceThoiGianId), Number(body.targetThoiGianId)); }
}
