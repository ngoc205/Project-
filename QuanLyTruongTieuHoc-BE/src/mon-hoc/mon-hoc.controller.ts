import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { MonHocService } from './mon-hoc.service';
import { MonHoc } from './mon-hoc.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('mon-hoc')
@UseGuards(JwtAuthGuard) // Bảo vệ toàn bộ các API môn học bằng JWT token
export class MonHocController {
  constructor(private readonly monHocService: MonHocService) {}

  @Post()
  create(@Body() data: Partial<MonHoc>) {
    return this.monHocService.create(data);
  }

  @Get()
  findAll() {
    return this.monHocService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.monHocService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<MonHoc>) {
    return this.monHocService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.monHocService.remove(+id);
  }
}