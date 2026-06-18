import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ThoiKhoaBieuService } from './thoi-khoa-bieu.service';

@Controller('thoi-khoa-bieu')
export class ThoiKhoaBieuController {
  constructor(private readonly thoiKhoaBieuService: ThoiKhoaBieuService) {}

  @Get('options')
  getOptions() {
    return this.thoiKhoaBieuService.getOptions();
  }

  @Get()
  findByClass(@Query('lopId') lopId: string) {
    return this.thoiKhoaBieuService.findByClass(Number(lopId));
  }

  @Put(':lopId')
  updateByClass(@Param('lopId') lopId: string, @Body() body: any) {
    return this.thoiKhoaBieuService.updateByClass(Number(lopId), body?.entries || []);
  }
}
