import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Query,
  Delete,
} from '@nestjs/common';

import { CanBoService } from './can-bo.service';
import { CanBo } from './entities/can-bo.entity';

@Controller('can-bo')
export class CanBoController {
  constructor(private readonly canBoService: CanBoService) {}

  // CREATE
  @Post()
  create(@Body() canBo: any) {
    return this.canBoService.create(canBo);
  }

  // READ ALL
  @Get()
  findAll() {
    return this.canBoService.findAll();
  }

  // SEARCH
  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.canBoService.search(keyword);
  }

  // READ ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.canBoService.findOne(+id);
  }

  // UPDATE
  @Patch(':id')
  update(@Param('id') id: string, @Body() canBo: Partial<CanBo>) {
    return this.canBoService.update(+id, canBo);
  }

  // ⭐ DELETE (PHẦN BẠN THIẾU)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.canBoService.remove(+id);
  }
}