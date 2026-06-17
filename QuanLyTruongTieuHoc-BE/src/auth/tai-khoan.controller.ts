import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { TaiKhoanService } from './tai-khoan.service';
import { TaiKhoan } from './tai-khoan.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('tai-khoan') // Sẽ mở cổng http://localhost:3000/tai-khoan
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CanBo') // QUAN TRỌNG: Chỉ Cán bộ mới được gọi các API này
export class TaiKhoanController {
  constructor(private readonly taiKhoanService: TaiKhoanService) {}

  @Get()
  findAll() {
    return this.taiKhoanService.findAll();
  }

  @Post()
  create(@Body() data: Partial<TaiKhoan>) {
    return this.taiKhoanService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<TaiKhoan>) {
    return this.taiKhoanService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taiKhoanService.remove(+id);
  }
}