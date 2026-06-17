import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'CHUOI_BAO_MAT_JWT_SECRET_KEY_123',
    });
  }

  async validate(payload: any) {
    // Sửa lại đoạn return này để RolesGuard có thể đọc được user.VaiTro
    return { 
      TaiKhoanID: payload.sub, 
      TenDangNhap: payload.username, 
      VaiTro: payload.role // Đã đổi 'role' thành 'VaiTro'
    };
  }
}