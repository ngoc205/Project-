// src/pages/TeacherDashboard.jsx
import React from 'react';

export default function TeacherDashboard({ onNavigate }) {
  
  const handleLogout = () => {
    localStorage.removeItem('token'); // Xóa token
    onNavigate('login'); // Quay lại trang đăng nhập
  };

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <h3>Menu Giáo viên</h3>
        <ul>
          <li>Danh sách lớp</li>
          <li>Nhập điểm</li>
          <li>Thời khóa biểu</li>
        </ul>
        <button onClick={handleLogout} className="logout-button">Đăng xuất</button>
      </nav>

      <main className="content">
        <h1>Chào mừng bạn trở lại!</h1>
        <p>Đây là khu vực dành riêng cho Giáo viên trường Lạc Long Quân.</p>
        <div className="card">
            <h3>Thông báo mới</h3>
            <p>Họp hội đồng giáo viên vào lúc 14:00 chiều nay.</p>
        </div>
      </main>
    </div>
  );
}