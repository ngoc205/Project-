import { Controller, Get, Param } from '@nestjs/common';
import { GiaovienService } from './giaovien.service';

@Controller('api/giaovien')
export class GiaovienController {
  constructor(private readonly giaovienService: GiaovienService) {}

  // Mở API lấy lịch dạy
  @Get(':id/lich-day')
  async getLichDay(@Param('id') id: string) {
    return await this.giaovienService.getLichDay(Number(id));
  }

  // Mở API lấy thông tin lớp chủ nhiệm
  @Get(':id/lop-chu-nhiem')
  async getLopChuNhiem(@Param('id') id: string) {
    return await this.giaovienService.getLopChuNhiem(Number(id));
  }
}