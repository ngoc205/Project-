import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaiKhoan } from './tai-khoan.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

// IMPORT 2 FILE MỚI
import { TaiKhoanController } from './tai-khoan.controller';
import { TaiKhoanService } from './tai-khoan.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaiKhoan]),
    PassportModule,
    JwtModule.register({
      secret: 'CHUOI_BAO_MAT_JWT_SECRET_KEY_123',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  // KHAI BÁO THÊM CONTROLLER VÀ SERVICE VÀO ĐÂY
  controllers: [AuthController, TaiKhoanController],
  providers: [AuthService, JwtStrategy, TaiKhoanService],
  exports: [AuthService],
})
export class AuthModule {}
