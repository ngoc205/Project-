import AdminMonHocPage from './AdminMonHocPage';
import AdminTaiKhoanPage from './AdminTaiKhoanPage';
import AdminGiaoVienPage from './AdminGiaoVienPage';
import AdminHocSinhPage from './AdminHocSinhPage';
import AdminLopHocPage from './AdminLopHocPage';
import AdminThoiKhoaBieuPage from './AdminThoiKhoaBieuPage';

export default function AdminDashboard({ page, onNavigate }) {
  const menuItems = [
    { id: 'admin-taikhoan', label: '👤 Quản lý Tài khoản' },
    { id: 'admin-giaovien', label: '👨‍🏫 Quản lý Giáo viên' },
    { id: 'admin-hocsinh', label: '🎓 Quản lý Học sinh' },
    { id: 'admin-lophoc', label: '🏫 Quản lý Khối - Lớp' },
    { id: 'admin-monhoc', label: '📚 Quản lý Môn học' },
    { id: 'admin-thoikhoabieu', label: '📅 Quản lý Thời khóa biểu' },
  ];

  const developedPages = [
    'admin-monhoc',
    'admin-taikhoan',
    'admin-giaovien',
    'admin-hocsinh',
    'admin-lophoc',
    'admin-thoikhoabieu',
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#f0f2f5' }}>
      <div style={{ flex: '0 0 280px', width: '280px', backgroundColor: '#1a365d', color: 'white', padding: '20px 0' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '1px solid #2b6cb0', padding: '0 18px 15px', lineHeight: 1.35, whiteSpace: 'normal' }}>
          HỆ THỐNG ĐIỀU HÀNH
        </h3>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '15px 25px',
                  backgroundColor: page === item.id ? '#2b6cb0' : 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  lineHeight: 1.35,
                  transition: '0.3s',
                }}
                onMouseOver={(e) => {
                  if (page !== item.id) e.target.style.backgroundColor = '#2c5282';
                }}
                onMouseOut={(e) => {
                  if (page !== item.id) e.target.style.backgroundColor = 'transparent';
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1, padding: '30px', backgroundColor: 'white', margin: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        {page === 'admin-monhoc' && <AdminMonHocPage />}
        {page === 'admin-taikhoan' && <AdminTaiKhoanPage />}
        {page === 'admin-giaovien' && <AdminGiaoVienPage />}
        {page === 'admin-hocsinh' && <AdminHocSinhPage />}
        {page === 'admin-lophoc' && <AdminLopHocPage />}
        {page === 'admin-thoikhoabieu' && <AdminThoiKhoaBieuPage />}

        {!developedPages.includes(page) && (
          <div style={{ textAlign: 'center', marginTop: '50px', color: '#718096' }}>
            <h2>Tính năng đang được phát triển...</h2>
            <p>Vui lòng chọn chức năng đã có trong menu để trải nghiệm.</p>
          </div>
        )}
      </div>
    </div>
  );
}
