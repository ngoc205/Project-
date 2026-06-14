import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { CanBoService } from './can-bo.service';
import { CanBo } from './entities/can-bo.entity';

@Controller('can-bo')
export class CanBoController {
  constructor(private readonly canBoService: CanBoService) {}

  @Post()
  create(@Body() canBo: CanBo) {
    return this.canBoService.create(canBo);
  }

  @Get()
  findAll() {
    return this.canBoService.findAll();
  }

  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.canBoService.search(keyword);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() canBo: Partial<CanBo>,
  ) {
    return this.canBoService.update(+id, canBo);
  }
}