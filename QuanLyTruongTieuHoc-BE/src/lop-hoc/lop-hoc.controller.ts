import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { LopHocService } from './lop-hoc.service';

@Controller('lop-hoc')
export class LopHocController {
  constructor(private readonly lopHocService: LopHocService) {}

  @Get()
  findAll() {
    return this.lopHocService.findAll();
  }

  @Get('options')
  getOptions() {
    return this.lopHocService.getOptions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lopHocService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: any) {
    return this.lopHocService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.lopHocService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lopHocService.remove(Number(id));
  }
}
