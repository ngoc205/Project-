import React from 'react';
import AdminMonHocPage from './AdminMonHocPage';
import AdminTaiKhoanPage from './AdminTaiKhoanPage';
import AdminCanBoPage from './AdminCanBoPage';
import AdminHocSinhPage from './AdminHocSinhPage';

export default function AdminDashboard({ page, onNavigate }) {
  const menuItems = [
    { id: 'admin-taikhoan', label: '👤 Quản lý Tài khoản' },
    { id: 'admin-canbo', label: '👔 Quản lý Cán bộ' },
    { id: 'admin-giaovien', label: '👨‍🏫 Quản lý Giáo viên' },
    { id: 'admin-hocsinh', label: '🎓 Quản lý Học sinh' },
    { id: 'admin-lophoc', label: '🏫 Quản lý Khối - Lớp' },
    { id: 'admin-monhoc', label: '📚 Quản lý Môn học' },
    { id: 'admin-diemthi', label: '📝 Quản lý Điểm thi' },
    { id: 'admin-thoikhoabieu', label: '📅 Quản lý Thời khóa biểu' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: '260px',
          backgroundColor: '#1a365d',
          color: 'white',
          padding: '20px 0',
        }}
      >
        <h3
          style={{
            textAlign: 'center',
            marginBottom: '30px',
            borderBottom: '1px solid #2b6cb0',
            paddingBottom: '15px',
          }}
        >
          HỆ THỐNG ĐIỀU HÀNH
        </h3>

        <ul
          style={{
            listStyleType: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '15px 25px',
                  backgroundColor:
                    page === item.id ? '#2b6cb0' : 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: '0.3s',
                }}
                onMouseOver={(e) => {
                  if (page !== item.id) {
                    e.target.style.backgroundColor = '#2c5282';
                  }
                }}
                onMouseOut={(e) => {
                  if (page !== item.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* CONTENT */}
      <div
        style={{
          flex: 1,
          padding: '30px',
          backgroundColor: 'white',
          margin: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        {page === 'admin-monhoc' && <AdminMonHocPage />}

        {page === 'admin-taikhoan' && <AdminTaiKhoanPage />}

        {page === 'admin-canbo' && <AdminCanBoPage />}

        {page === 'admin-hocsinh' && <AdminHocSinhPage />}

        {page !== 'admin-monhoc' &&
          page !== 'admin-taikhoan' &&
          page !== 'admin-canbo' &&
          page !== 'admin-hocsinh' && (
            <div
              style={{
                textAlign: 'center',
                marginTop: '50px',
                color: '#718096',
              }}
            >
              <h2>Tính năng đang được phát triển...</h2>

              <p>
                Vui lòng chọn Quản lý Tài khoản, Quản lý Môn học,
                Quản lý Cán bộ hoặc Quản lý Học sinh để trải nghiệm.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}