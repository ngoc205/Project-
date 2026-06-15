import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaiKhoan } from './tai-khoan.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(TaiKhoan)
    private taiKhoanRepository: Repository<TaiKhoan>,
    private jwtService: JwtService,
  ) {}

  async register(data: any): Promise<any> {
    if (!data.TenDangNhap || !data.MatKhau || !data.VaiTro) {
      throw new BadRequestException('Vui lòng điền đầy đủ TenDangNhap, MatKhau và VaiTro!');
    }

    const exists = await this.taiKhoanRepository.findOne({ 
      where: { TenDangNhap: data.TenDangNhap } 
    });
    if (exists) {
      throw new BadRequestException('Tên đăng nhập này đã tồn tại trong hệ thống!');
    }

    const hashedPassword = await bcrypt.hash(data.MatKhau, 10);
    const newAccount = this.taiKhoanRepository.create({
      TenDangNhap: data.TenDangNhap,
      MatKhau: hashedPassword,
      VaiTro: data.VaiTro,
      IsActive: true
    });
    
const savedAccount = await this.taiKhoanRepository.save(newAccount);
// Bóc tách MatKhau ra riêng, phần còn lại gom vào biến result
const { MatKhau, ...result } = savedAccount; 
return result;
  }

  async login(data: any): Promise<any> {
    if (!data.TenDangNhap || !data.MatKhau) {
      throw new BadRequestException('Vui lòng điền đầy đủ TenDangNhap và MatKhau!');
    }

    const user = await this.taiKhoanRepository.findOne({ 
      where: { TenDangNhap: data.TenDangNhap } 
    });
    
    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại!');
    }

    const isPasswordValid = await bcrypt.compare(data.MatKhau, user.MatKhau);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai mật khẩu!');
    }

    if (!user.IsActive) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa!');
    }

    const payload = { 
      username: user.TenDangNhap, 
      sub: user.TaiKhoanID, 
      role: user.VaiTro 
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}