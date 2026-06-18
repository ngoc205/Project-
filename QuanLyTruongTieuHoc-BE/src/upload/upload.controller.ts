import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';

const imageDir = join(process.cwd(), '..', 'QuanLyTruongTieuHoc-FE', 'public', 'images');

function normalizeName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

@Controller('upload')
export class UploadController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          if (!existsSync(imageDir)) {
            mkdirSync(imageDir, { recursive: true });
          }
          callback(null, imageDir);
        },
        filename: (_req, file, callback) => {
          const ext = extname(file.originalname);
          const baseName = normalizeName(file.originalname.replace(ext, ''));
          callback(null, `${Date.now()}-${baseName}${ext.toLowerCase()}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('Chỉ được chọn file ảnh!'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh!');
    }

    return {
      filename: file.filename,
      path: `/images/${file.filename}`,
    };
  }
}
