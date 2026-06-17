import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lấy danh sách các quyền được phép truy cập API này
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu API không gắn nhãn @Roles, cho phép đi qua
    if (!requiredRoles) {
      return true;
    }

    // 2. Lấy thông tin user từ request (đã được JwtStrategy giải mã trước đó)
    const { user } = context.switchToHttp().getRequest();

    // 3. Kiểm tra xem user có tồn tại và VaiTro có nằm trong danh sách cho phép không
    const hasRole = user && requiredRoles.includes(user.VaiTro);

    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này!');
    }

    return true;
  }
}