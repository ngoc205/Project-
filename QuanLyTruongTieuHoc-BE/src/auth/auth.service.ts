import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaiKhoan } from './tai-khoan.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(TaiKhoan)
    private taiKhoanRepository: Repository<TaiKhoan>,
    private jwtService: JwtService,
  ) {}

  // =========================================================
  // ĐÃ XÓA HOÀN TOÀN HÀM REGISTER (KHÔNG CHO PHÉP ĐĂNG KÝ MỚI)
  // =========================================================

  async login(data: any): Promise<any> {
    if (!data.TenDangNhap || !data.MatKhau) {
      throw new BadRequestException('Vui lòng điền đầy đủ TenDangNhap và MatKhau!');
    }

    // Tìm kiếm tài khoản dựa vào tên đăng nhập
    const user = await this.taiKhoanRepository.findOne({ 
      where: { TenDangNhap: data.TenDangNhap } 
    });
    
    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại!');
    }

    // SO SÁNH TRỰC TIẾP CHUỖI MẬT KHẨU THÔ (PLAIN TEXT) - KHÔNG DÙNG BCRYPT
    const isPasswordValid = (data.MatKhau === user.MatKhau);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai mật khẩu!');
    }

    // Kiểm tra trạng thái kích hoạt của tài khoản
    if (!user.IsActive) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa!');
    }

    // RÀNG BUỘC PHÂN QUYỀN CHẶN ĐĂNG NHẬP: Chỉ chấp nhận Giáo viên và Cán bộ
    if (user.VaiTro !== 'GiaoVien' && user.VaiTro !== 'CanBo') {
      throw new UnauthorizedException('Tài khoản không có quyền truy cập vào hệ thống này!');
    }

    // Cấu hình thông tin lưu trữ vào Token
    const payload = { 
      username: user.TenDangNhap, 
      sub: user.TaiKhoanID, 
      role: user.VaiTro 
    };

    return {
      message: 'Đăng nhập thành công!',
      accessToken: this.jwtService.sign(payload),
      user: {
        TaiKhoanID: user.TaiKhoanID,
        TenDangNhap: user.TenDangNhap,
        VaiTro: user.VaiTro
      }
    };
  }
}