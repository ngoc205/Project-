import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
    // Ràng buộc dữ liệu đầu vào khớp với các trường NOT NULL trong SQL Server
    const tenMonHoc = data.TenMonHoc?.trim();
    if (!tenMonHoc) {
      throw new BadRequestException('Tên môn học không được để trống!');
    }
    if (data.SoTiet === undefined || data.SoTiet === null) {
      throw new BadRequestException('Số tiết không được để trống!');
    }

    await this.ensureUniqueName(tenMonHoc);

    const newMonHoc = this.monHocRepository.create({
      ...data,
      TenMonHoc: tenMonHoc,
    });
    return await this.monHocRepository.save(newMonHoc);
  }

  async findAll(): Promise<MonHoc[]> {
    return await this.monHocRepository.find({
      order: { MonHocID: 'DESC' },
    });
  }

  async findOne(id: number): Promise<MonHoc> {
    const monHoc = await this.monHocRepository.findOne({
      where: { MonHocID: id },
    });
    if (!monHoc) {
      throw new NotFoundException(`Không tồn tại môn học nào với ID: ${id}`);
    }
    return monHoc;
  }

  async update(id: number, data: Partial<MonHoc>): Promise<MonHoc> {
    // Kiểm tra môn học tồn tại trước khi cập nhật
    await this.findOne(id);

    // Ngăn chặn việc gửi chuỗi rỗng lên cho các trường NOT NULL
    const tenMonHoc = data.TenMonHoc?.trim();
    if (data.TenMonHoc !== undefined && !tenMonHoc) {
      throw new BadRequestException(
        'Tên môn học không được phép là chuỗi rỗng!',
      );
    }

    if (tenMonHoc) {
      await this.ensureUniqueName(tenMonHoc, id);
      data.TenMonHoc = tenMonHoc;
    }

    await this.monHocRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.monHocRepository.delete(id);
    return { message: `Đã xóa thành công môn học có ID ${id} khỏi hệ thống.` };
  }

  private async ensureUniqueName(name: string, currentId?: number) {
    const existing = await this.monHocRepository
      .createQueryBuilder('monHoc')
      .where('LOWER(monHoc.TenMonHoc) = LOWER(:name)', { name })
      .andWhere(currentId ? 'monHoc.MonHocID <> :currentId' : '1 = 1', {
        currentId,
      })
      .getOne();

    if (existing) {
      throw new BadRequestException('Môn học này đã tồn tại, không thể thêm trùng!');
    }
  }
}
