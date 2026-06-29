import { Controller, Post, Body } from '@nestjs/common';
import { DiemService } from './diem.service';
import { NhapDiemDto } from './dto/nhap-diem.dto';

@Controller('api/diem') // Tạo đường dẫn gốc cho API
export class DiemController {
  constructor(private readonly diemService: DiemService) {}

  // Bắt phương thức POST từ Frontend gửi xuống
  @Post('cap-nhat')
  async capNhatDiem(@Body() dto: NhapDiemDto) {
    // Chuyển cục dữ liệu (dto) xuống cho Service lưu vào DB
    return await this.diemService.capNhatDiem(dto);
  }
}