import { useState, useEffect } from 'react';
import './canhan.css'; 

function EyeIcon({ hidden }) {
  if (hidden) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.4 5.4A9.8 9.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7a12.8 12.8 0 0 1-2.1 3.2" />
        <path d="M6.2 6.2A12.8 12.8 0 0 0 2.5 12c1 2.5 4.5 7 9.5 7a9.8 9.8 0 0 0 4.5-1.1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ThongTinCaNhan({ teacherId, onNavigate }) {
  // State thông tin cá nhân
  const [profile, setProfile] = useState({
    TenGiaoVien: '',
    NgaySinh: '',
    GioiTinh: '',
    SoDienThoai: '',
    DiaChi: ''
  });

  // State đổi mật khẩu
  const [passwords, setPasswords] = useState({
    MatKhauCu: '',
    MatKhauMoi: '',
    XacNhanMatKhau: ''
  });
  const [showPassword, setShowPassword] = useState({
    MatKhauCu: false,
    MatKhauMoi: false,
    XacNhanMatKhau: false
  });

  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'success',
  });

  const showModal = (title, message, type = 'success') => {
    setModal({ open: true, title, message, type });
  };

  const closeModal = () => {
    setModal((current) => ({ ...current, open: false }));
  };

  const renderPasswordInput = (field, value, onChange) => (
    <div className="password-input-wrap">
      <input
        type={showPassword[field] ? 'text' : 'password'}
        maxLength="30"
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        className="password-toggle"
        aria-label={showPassword[field] ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        title={showPassword[field] ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        onClick={() => setShowPassword((current) => ({ ...current, [field]: !current[field] }))}
      >
        <EyeIcon hidden={showPassword[field]} />
      </button>
    </div>
  );

  // Load dữ liệu khi vào trang
  useEffect(() => {
    fetch(`http://localhost:3000/api/giaovien/canhan/${teacherId}`)
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error('Lỗi tải thông tin:', err));
  }, [teacherId]);

  // Xử lý lưu thông tin liên hệ (U5)
  const handleLuuThongTin = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/giaovien/canhan/update-info/${teacherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          SoDienThoai: profile.SoDienThoai,
          DiaChi: profile.DiaChi
        })
      });
      if (res.ok) {
        showModal('Thành công', 'Lưu thông tin thành công!', 'success');
      } else {
        showModal('Lỗi', 'Có lỗi xảy ra khi lưu thông tin.', 'error');
      }
    } catch {
      showModal('Lỗi kết nối', 'Lỗi kết nối đến máy chủ.', 'error');
    }
  };

  // Xử lý đổi mật khẩu (U6)
  const handleDoiMatKhau = async () => {
    if (!passwords.MatKhauCu || !passwords.MatKhauMoi || !passwords.XacNhanMatKhau) {
      showModal('Thiếu thông tin', 'Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu.', 'error');
      return;
    }

    if (passwords.MatKhauMoi !== passwords.XacNhanMatKhau) {
      showModal('Sai xác nhận', 'Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:3000/api/giaovien/canhan/change-password/${teacherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          MatKhauCu: passwords.MatKhauCu,
          MatKhauMoi: passwords.MatKhauMoi
        })
      });
      
      if (res.ok) {
        showModal('Thành công', 'Mật khẩu đã thay đổi. Vui lòng đăng nhập lại.', 'success');
        setPasswords({ MatKhauCu: '', MatKhauMoi: '', XacNhanMatKhau: '' });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('vaiTro');
        setTimeout(() => onNavigate('login'), 1200);
      } else {
        const errorData = await res.json().catch(() => ({}));
        showModal('Lỗi', errorData.message || 'Mật khẩu không thể thay đổi', 'error');
      }
    } catch {
      showModal('Lỗi kết nối', 'Lỗi kết nối đến máy chủ.', 'error');
    }
  };

  return (
    <div className="profile-page container">
      {/* KHỐI 1: THÔNG TIN CÁ NHÂN (U5) */}
      <div className="section-card">
        <h2>Thông tin cá nhân</h2>
        <div className="form-group row">
          <label>Họ và tên</label>
          <span className="readonly-text">{profile.TenGiaoVien}</span>
        </div>
        <div className="form-group row">
          <label>Ngày sinh</label>
          <span className="readonly-text">
  {profile.NgaySinh ? new Date(profile.NgaySinh).toLocaleDateString('vi-VN') : ''}
</span>
        </div>
        {/* Các trường cho phép chỉnh sửa */}
        <div className="form-group row">
          <label>Số điện thoại</label>
          <input 
  type="tel" 
  maxLength="11" 
  value={profile.SoDienThoai || ''} 
  onChange={(e) => setProfile({...profile, SoDienThoai: e.target.value})} 
/>
        </div>
        <div className="form-group row">
          <label>Địa chỉ nhà</label>
          <textarea 
            maxLength="100" 
            value={profile.DiaChi || ''} 
            onChange={(e) => setProfile({...profile, DiaChi: e.target.value})} 
            rows="3"
          />
        </div>
        <div className="action-buttons">
          <button className="btn-primary" onClick={handleLuuThongTin}>Lưu thông tin</button>
          <button className="btn-secondary" onClick={() => onNavigate('teacher-dashboard')}>Trở về</button>
        </div>
      </div>

      <hr />

      {/* KHỐI 2: ĐỔI MẬT KHẨU (U6) */}
      <div className="section-card">
        <h2>Thay đổi mật khẩu</h2>
        <div className="form-group row">
          <label>Mật khẩu cũ</label>
          {renderPasswordInput('MatKhauCu', passwords.MatKhauCu, (e) => setPasswords({...passwords, MatKhauCu: e.target.value}))}
        </div>
        <div className="form-group row">
          <label>Mật khẩu mới</label>
          {renderPasswordInput('MatKhauMoi', passwords.MatKhauMoi, (e) => setPasswords({...passwords, MatKhauMoi: e.target.value}))}
        </div>
        <div className="form-group row">
          <label>Xác nhận mật khẩu mới</label>
          {renderPasswordInput('XacNhanMatKhau', passwords.XacNhanMatKhau, (e) => setPasswords({...passwords, XacNhanMatKhau: e.target.value}))}
        </div>
        <div className="action-buttons">
          <button className="btn-primary" onClick={handleDoiMatKhau}>Đồng Ý</button>
        </div>
      </div>

      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-header ${modal.type}`}>
              <h3>{modal.title}</h3>
            </div>
            <div className="modal-body">
              <p>{modal.message}</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThongTinCaNhan;
