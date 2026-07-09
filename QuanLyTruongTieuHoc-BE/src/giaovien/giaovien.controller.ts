import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { GiaovienService } from './giaovien.service';

@Controller('api/giaovien')
export class GiaovienController {
  constructor(private readonly giaovienService: GiaovienService) {}

  @Get()
  findAll() {
    return this.giaovienService.findAll();
  }

   // API lấy thông tin cá nhân
  @Get('canhan/:taiKhoanId')
  async getProfile(@Param('taiKhoanId') id: string) {
    return this.giaovienService.getThongTinCaNhan(Number(id));
  }

  // API lưu thông tin cá nhân
  @Put('canhan/update-info/:taiKhoanId')
  async updateInfo(
    @Param('taiKhoanId') id: string,
    @Body() payload: { SoDienThoai: string; DiaChi: string }
  ) {
    return this.giaovienService.updateThongTinCaNhan(Number(id), payload.SoDienThoai, payload.DiaChi);
  }

  // API thay đổi mật khẩu
  @Put('canhan/change-password/:taiKhoanId')
  async changePassword(
    @Param('taiKhoanId') id: string,
    @Body() payload: { MatKhauCu: string; MatKhauMoi: string }
  ) {
    return this.giaovienService.changePassword(Number(id), payload.MatKhauCu, payload.MatKhauMoi);
  }

  @Get('options')
  getOptions() {
    return this.giaovienService.getOptions();
  }

  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.giaovienService.search(keyword);
  }

  @Get('hocsinh/detail/:id')
  getChiTietHocSinh(@Param('id') id: string) {
    return this.giaovienService.getChiTietHocSinh(Number(id));
  }

  @Get('lop/:lopId/monhoc')
  getMonHocTheoLop(@Param('lopId') lopId: string) {
    return this.giaovienService.getMonHocTheoLop(Number(lopId));
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.giaovienService.findOne(Number(id));
  }

  @Get('teacher-detail/:id')
  findTeacherDetail(@Param('id') id: string) {
    return this.giaovienService.findOne(Number(id));
  }

  @Get(':id/diem')
  getBangDiemLopChuNhiem(@Param('id') id: string, @Query('monHocId') monHocId?: string) {
    return this.giaovienService.getBangDiemLopChuNhiem(
      Number(id),
      monHocId ? Number(monHocId) : undefined,
    );
  }

  @Get(':id/lich-day')
  getLichDay(@Param('id') id: string) {
    return this.giaovienService.getLichDay(Number(id));
  }

  @Get(':id/lop-chu-nhiem')
  getLopChuNhiem(@Param('id') id: string) {
    return this.giaovienService.getLopChuNhiem(Number(id));
  }

  @Post()
  create(@Body() body: Parameters<GiaovienService['create']>[0]) {
    return this.giaovienService.create(body);
  }

  @Put(':id/diem')
  luuBangDiemLopChuNhiem(
    @Param('id') id: string,
    @Body() body: Parameters<GiaovienService['luuBangDiemLopChuNhiem']>[1],
  ) {
    return this.giaovienService.luuBangDiemLopChuNhiem(Number(id), body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Parameters<GiaovienService['update']>[1]) {
    return this.giaovienService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.giaovienService.remove(Number(id));
  }
}
