import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonHoc } from './mon-hoc.entity';

@Injectable()
export class MonHocService {
  constructor(
    @InjectRepository(MonHoc)
    private readonly monHocRepository: Repository<MonHoc>,
  ) {}

  async create(data: Partial<MonHoc>): Promise<MonHoc> {
    const newMonHoc = this.monHocRepository.create(data);
    return await this.monHocRepository.save(newMonHoc);
  }

  async findAll(): Promise<MonHoc[]> {
    return await this.monHocRepository.find();
  }

  async findOne(id: number): Promise<MonHoc> {
    const monHoc = await this.monHocRepository.findOne({ 
      where: { MonHocID: id } 
    });
    if (!monHoc) {
      throw new NotFoundException(`Không tồn tại môn học nào với ID: ${id}`);
    }
    return monHoc;
  }

  async update(id: number, data: Partial<MonHoc>): Promise<MonHoc> {
    await this.findOne(id);
    await this.monHocRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.monHocRepository.delete(id);
    return { message: `Đã xóa thành công môn học có ID ${id} khỏi hệ thống.` };
  }
}