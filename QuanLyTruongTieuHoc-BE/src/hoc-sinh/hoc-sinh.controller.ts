import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  Post,
  Query,
} from '@nestjs/common';

import { HocSinhService } from './hoc-sinh.service';
import { HocSinh } from './entities/hoc-sinh.entity';

@Controller('hoc-sinh')
export class HocSinhController {
  constructor(private readonly hocSinhService: HocSinhService) {}

  // ⭐ CREATE
  @Post()
  create(@Body() hocSinh: any) {
    return this.hocSinhService.create(hocSinh);
  }

  // READ ALL
  @Get()
  findAll() {
    return this.hocSinhService.findAll();
  }

  // ⭐ SEARCH
  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.hocSinhService.search(keyword);
  }

  // READ ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hocSinhService.findOne(+id);
  }

  // UPDATE
  @Patch(':id')
  update(@Param('id') id: string, @Body() hocSinh: Partial<HocSinh>) {
    return this.hocSinhService.update(+id, hocSinh);
  }

  // DELETE
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hocSinhService.remove(+id);
  }
}