import AuthLayout, { AuthField } from '../components/AuthLayout'

function LoginPage({ onNavigate }) {
  return (
    <AuthLayout imageName="AnhTruongHoc2.jpg" title="Chào mừng trở lại!" text="Hệ thống quản lý nội bộ dành cho Cán bộ và Giáo viên trường Tiểu học Lạc Long Quân.">
      <h1>Đăng nhập hệ thống</h1>
      <p>Vui lòng nhập thông tin tài khoản của bạn</p>
      <AuthField label="Tên đăng nhập" placeholder="Nhập mã cán bộ hoặc email" />
      <AuthField label="Mật khẩu" placeholder="Nhập mật khẩu" type="password" />
      <div className="auth-options">
        <label><input type="checkbox" /> Ghi nhớ đăng nhập</label>
        <button type="button">Quên mật khẩu?</button>
      </div>
      <button className="primary-button full" type="button">Đăng nhập</button>
      <div className="auth-actions">
        <button type="button" onClick={() => onNavigate('home')}>Trang chủ</button>
        <button type="button" onClick={() => onNavigate('register')}>Đăng ký</button>
      </div>
      <small>Bạn gặp sự cố? <strong>Liên hệ Quản trị viên</strong></small>
    </AuthLayout>
  )
}

export default LoginPage
