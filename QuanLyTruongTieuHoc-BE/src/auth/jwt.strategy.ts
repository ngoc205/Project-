import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

export interface AuthenticatedUser {
  TaiKhoanID: number;
  TenDangNhap: string;
  VaiTro: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'CHUOI_BAO_MAT_JWT_SECRET_KEY_123',
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    // Sửa lại đoạn return này để RolesGuard có thể đọc được user.VaiTro
    return {
      TaiKhoanID: payload.sub,
      TenDangNhap: payload.username,
      VaiTro: payload.role, // Đã đổi 'role' thành 'VaiTro'
    };
  }
}
