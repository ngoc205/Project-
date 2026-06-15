import { useState } from 'react';
import AuthLayout, { AuthField } from '../components/AuthLayout';
import api from '../api/axiosClient';

export default function LoginPage({ onNavigate }) {
  const [formData, setFormData] = useState({ 
    TenDangNhap: '', 
    MatKhau: '' 
  });

const handleLogin = async () => {
  console.log("Đang gửi đăng nhập:", formData);

  try {
    const res = await api.post('/auth/login', formData);

    localStorage.setItem('token', res.data.accessToken);

    localStorage.setItem(
      'user',
      JSON.stringify({
        TenDangNhap: formData.TenDangNhap
      })
    );

    alert("Đăng nhập thành công!");
    onNavigate('home');
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    alert("Đăng nhập thất bại! Sai tên đăng nhập hoặc mật khẩu.");
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
        placeholder="Nhập mã cán bộ"
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
        <button type="button" onClick={() => onNavigate('register')}>Đăng ký</button>
      </div>
    </AuthLayout>
  );
}