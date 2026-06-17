import { navItems } from '../data/schoolData'

function Header({
  activePage,
  menuOpen,
  setMenuOpen,
  onNavigate,
  user,
  onLogout
}) {

  // Hàm xử lý điều hướng khi bấm vào tên người dùng
  const handleUserClick = () => {
    if (!user) return;
    
    if (user.VaiTro === 'CanBo') {
      onNavigate('admin-monhoc'); // Cán bộ -> Vào trang quản lý
    } else if (user.VaiTro === 'GiaoVien') {
      onNavigate('teacher-dashboard'); // Giáo viên -> Vào trang xem TKB
    }
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <button
          className="brand"
          type="button"
          onClick={() => onNavigate('home')}
          aria-label="Trang chủ"
        >
          <span className="logo-mark">LLQ</span>
          <span>
            <strong>Tiểu học Lạc Long Quân</strong>
            <small>Ươm mầm tri thức - Thắp sáng tương lai</small>
          </span>
        </button>

        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Mở menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav
          className={menuOpen ? 'main-nav open' : 'main-nav'}
          aria-label="Điều hướng chính"
        >
          {navItems.map((item) => (
            <button
              key={item.page}
              className={activePage === item.page ? 'active' : ''}
              type="button"
              onClick={() => onNavigate(item.page)}
            >
              {item.label}
            </button>
          ))}

          {user?.VaiTro === 'GiaoVien' && (
            <button
              className={activePage === 'teacher-dashboard' ? 'active' : ''}
              type="button"
              onClick={() => onNavigate('teacher-dashboard')}
            >
              Trang GV
            </button>
          )}

          {user?.VaiTro === 'CanBo' && (
            <button
              className={activePage.startsWith('admin-') ? 'active' : ''}
              type="button"
              onClick={() => onNavigate('admin-monhoc')}
            >
              Quản trị
            </button>
          )}
        </nav>

        {user ? (
          <div className="user-box" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            
            {/* Đã thay đổi thẻ span thành button và thêm sự kiện onClick */}
            <button 
              className="user-name" 
              type="button"
              onClick={handleUserClick}
              title="Đi đến trang bảng điều khiển của bạn"
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                fontSize: '1rem', 
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              👤 {user.TenDangNhap}
            </button>

            <button
              className="primary-pill"
              type="button"
              onClick={onLogout}
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <button
            className="primary-pill"
            type="button"
            onClick={() => onNavigate('login')}
          >
            Đăng nhập
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
