import { Controller, Get, Param } from '@nestjs/common';
import { GiaovienService } from './giaovien.service';

@Controller('api/giaovien')
export class GiaovienController {
  constructor(private readonly giaovienService: GiaovienService) {}

<<<<<<< Updated upstream
=======
  @Get()
  findAll() {
    return this.giaovienService.findAll();
  }

  @Get('options')
  getOptions() {
    return this.giaovienService.getOptions();
  }

 // Dùng route này cho chi tiết học sinh
  @Get('hocsinh/detail/:id') 
  async getChiTietHocSinh(@Param('id') id: string) {
      return await this.giaovienService.getChiTietHocSinh(Number(id));
  }

  // Nếu route 'detail/:id' bên dưới là để lấy chi tiết giáo viên, hãy đổi tên cho rõ ràng
  @Get('teacher-detail/:id') 
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

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
}
=======

  // Thêm API lấy môn học theo lớp
  @Get('lop/:lopId/monhoc')
  async getMonHocTheoLop(@Param('lopId') lopId: string) {
    return await this.giaovienService.getMonHocTheoLop(Number(lopId));
  }

}
>>>>>>> Stashed changes
