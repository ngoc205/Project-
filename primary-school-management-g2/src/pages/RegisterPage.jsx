import AuthLayout, { AuthField } from '../components/AuthLayout'

function RegisterPage({ onNavigate }) {
  return (
    <AuthLayout imageName="AnhTruongHoc.jpg" title="Gia nhập hệ thống!" text="Tạo tài khoản cán bộ hoặc giáo viên để sử dụng các tiện ích quản lý nội bộ.">
      <h1>Đăng ký tài khoản</h1>
      <p>Điền đầy đủ thông tin để gửi yêu cầu phê duyệt</p>
      <AuthField label="Họ và tên" placeholder="Nhập họ và tên" />
      <AuthField label="Tên đăng nhập" placeholder="Nhập tên đăng nhập" />
      <AuthField label="Mật khẩu" placeholder="Nhập mật khẩu" type="password" />
      <AuthField label="Xác nhận mật khẩu" placeholder="Nhập lại mật khẩu" type="password" />
      <AuthField label="Số điện thoại" placeholder="Nhập số điện thoại" />
      <AuthField label="Địa chỉ" placeholder="Nhập địa chỉ" />
      <AuthField label="Chức vụ" placeholder="Ví dụ: Giáo viên" />
      <button className="primary-button full" type="button">Đăng ký</button>
      <div className="auth-actions">
        <button type="button" onClick={() => onNavigate('login')}>Đăng nhập</button>
        <button type="button" onClick={() => onNavigate('home')}>Trang chủ</button>
      </div>
    </AuthLayout>
  )
}

export default RegisterPage
