import { useState } from 'react';
import AuthLayout, { AuthField } from '../components/AuthLayout';
import api from '../api/axiosClient';
import { useNotification } from '../components/NotificationProvider';

export default function LoginPage({ onNavigate }) {
  const { showError, showSuccess } = useNotification();
  const [formData, setFormData] = useState({ 
    TenDangNhap: '', 
    MatKhau: '' 
  });

  const handleLogin = async () => {
    console.log("Đang gửi đăng nhập:", formData);

    try {
      const res = await api.post('/auth/login', formData);

      // Lưu Token và Role vào localStorage
      localStorage.setItem('token', res.data.accessToken);
      
      const userInfo = res.data.user;
      localStorage.setItem('vaiTro', userInfo.VaiTro);
      localStorage.setItem('user', JSON.stringify({
        TaiKhoanID: userInfo.TaiKhoanID,
        TenDangNhap: userInfo.TenDangNhap,
        VaiTro: userInfo.VaiTro
      }));

      showSuccess('Đăng nhập thành công!');
      
      // Rẽ nhánh điều hướng dựa vào VaiTro
      if (userInfo.VaiTro === 'CanBo') {
        onNavigate('admin-monhoc'); // Đẩy thẳng Cán bộ vào trang quản lý Môn học
      } else if (userInfo.VaiTro === 'GiaoVien') {
        onNavigate('teacher-dashboard'); // Đẩy Giáo viên vào trang xem TKB
      } else {
        onNavigate('home');
      }

    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      showError('Đăng nhập thất bại! Sai tên đăng nhập hoặc mật khẩu.');
    }
  };

  return (
    <AuthLayout 
      imageName="AnhTruongHoc2.jpg" 
      title="Chào mừng trở lại!" 
      text="Hệ thống quản lý nội bộ dành cho Cán bộ và Giáo viên trường Tiểu học Lạc Long Quân."
    >
      <h1>Đăng nhập hệ thống</h1>
      <AuthField 
        label="Tên đăng nhập" 
        placeholder="Nhập tài khoản"
        value={formData.TenDangNhap} 
        onChange={(e) => setFormData({...formData, TenDangNhap: e.target.value})}
      />
      <AuthField 
        label="Mật khẩu" 
        placeholder="Nhập mật khẩu"
        type="password" 
        value={formData.MatKhau} 
        onChange={(e) => setFormData({...formData, MatKhau: e.target.value})}
      />
      
      <button className="primary-button full" type="button" onClick={handleLogin}>Đăng nhập</button>

      <div className="auth-actions">
        <button type="button" onClick={() => onNavigate('home')}>Trang chủ</button>
      </div>
    </AuthLayout>
  );
}
