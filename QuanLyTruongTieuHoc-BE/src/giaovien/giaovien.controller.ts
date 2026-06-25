import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { GiaovienService } from './giaovien.service';

@Controller('api/giaovien')
export class GiaovienController {
  constructor(private readonly giaovienService: GiaovienService) {}

  @Get()
  findAll() {
    return this.giaovienService.findAll();
  }

  @Get('options')
  getOptions() {
    return this.giaovienService.getOptions();
  }

  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.giaovienService.search(keyword);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.giaovienService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: Parameters<GiaovienService['create']>[0]) {
    return this.giaovienService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Parameters<GiaovienService['update']>[1]) {
    return this.giaovienService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.giaovienService.remove(Number(id));
  }

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
