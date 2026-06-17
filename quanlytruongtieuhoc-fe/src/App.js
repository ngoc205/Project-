import { useState } from 'react';
import './App.css';

import CanBoList from './pages/CanBo/CanBoList';
import HocSinhList from './pages/HocSinh/HocSinhList';

function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="app-container">

      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="logo-box">
            <h2>🏫 LLQ School</h2>
            <p>Hệ thống quản lý</p>
          </div>

          <button
            className={`menu-btn ${
              page === 'dashboard' ? 'active-menu' : ''
            }`}
            onClick={() => setPage('dashboard')}
          >
            📊 Trang tổng quan
          </button>

          <button
            className={`menu-btn ${
              page === 'canbo' ? 'active-menu' : ''
            }`}
            onClick={() => setPage('canbo')}
          >
            👨‍🏫 Quản lý cán bộ
          </button>

          <button
            className={`menu-btn ${
              page === 'hocsinh' ? 'active-menu' : ''
            }`}
            onClick={() => setPage('hocsinh')}
          >
            🎓 Quản lý học sinh
          </button>

          <button className="menu-btn">
            🏫 Quản lý lớp học
          </button>

          <button className="menu-btn">
            📅 Thời khóa biểu
          </button>

          <button className="menu-btn">
            📈 Báo cáo
          </button>
        </div>

        <div className="sidebar-footer">
          © 2026 LLQ School
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="header">
          <div>
            <h2>HỆ THỐNG QUẢN LÝ TRƯỜNG TIỂU HỌC</h2>
          </div>

          <div className="admin-box">
            <div>
              <b>Hoàng Vinh</b>
              <p>Quản trị viên</p>
            </div>

            <div className="avatar">
              HV
            </div>
          </div>
        </header>

        <div className="page-content">

          {page === 'dashboard' && (
            <>
              <h2 style={{ marginBottom: 20 }}>
                Trang tổng quan
              </h2>

              <div className="dashboard-grid">
                <Card
                  title="👨‍🏫 Tổng cán bộ"
                  value="45"
                  color="#2563eb"
                />

                <Card
                  title="🎓 Học sinh"
                  value="580"
                  color="#16a34a"
                />

                <Card
                  title="🏫 Lớp học"
                  value="18"
                  color="#f59e0b"
                />

                <Card
                  title="📅 Tiết học hôm nay"
                  value="72"
                  color="#dc2626"
                />
              </div>
            </>
          )}

          {page === 'canbo' && (
            <CanBoList />
          )}

          {page === 'hocsinh' && (
            <HocSinhList />
          )}
        </div>
      </main>
    </div>
  );
}

function Card({
  title,
  value,
  color,
}) {
  return (
    <div className="dashboard-card">
      <h4>{title}</h4>

      <h1 style={{ color }}>
        {value}
      </h1>
    </div>
  );
}

export default App;