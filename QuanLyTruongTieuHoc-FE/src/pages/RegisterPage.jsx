import { useState } from 'react';
import AuthLayout, { AuthField } from '../components/AuthLayout';
import api from '../api/axiosClient';

export default function RegisterPage({ onNavigate }) {
  // Đặt mặc định là 'GiaoVien' để tránh lỗi ngay từ đầu
  const [formData, setFormData] = useState({ 
    TenDangNhap: '', 
    MatKhau: '', 
    VaiTro: 'GiaoVien' 
  });

  const handleRegister = async () => {
    try {
      console.log("Đang gửi:", formData);
      await api.post('/auth/register', formData);
      alert("Đăng ký thành công!");
      onNavigate('login');
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Đăng ký thất bại! Hãy kiểm tra lại Tên đăng nhập.");
    }
  };

  return (
    <AuthLayout 
      imageName="AnhTruongHoc.jpg" 
      title="Gia nhập hệ thống!" 
      text="Tạo tài khoản để sử dụng các tiện ích quản lý nội bộ."
    >
      <h1>Đăng ký tài khoản</h1>
      
      <AuthField label="Tên đăng nhập" value={formData.TenDangNhap} 
        onChange={(e) => setFormData({...formData, TenDangNhap: e.target.value})} />
        
      <AuthField label="Mật khẩu" type="password" value={formData.MatKhau} 
        onChange={(e) => setFormData({...formData, MatKhau: e.target.value})} />
      
      <label className="auth-field">
        Vai trò
        <select 
          value={formData.VaiTro} 
          onChange={(e) => setFormData({...formData, VaiTro: e.target.value})}
          style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px' }}
        >
          {/* value phải là GiaoVien hoặc Admin khớp với DB */}
          <option value="GiaoVien">Giáo viên</option>
          <option value="Admin">Cán bộ</option>
        </select>
      </label>

      <button className="primary-button full" type="button" onClick={handleRegister}>Đăng ký</button>
      
      <div className="auth-actions">
        <button type="button" onClick={() => onNavigate('login')}>Đăng nhập</button>
      </div>
    </AuthLayout>
  );
}