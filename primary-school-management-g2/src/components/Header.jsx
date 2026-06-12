import { navItems } from '../data/schoolData'

function Header({ activePage, menuOpen, setMenuOpen, onNavigate }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <button className="brand" type="button" onClick={() => onNavigate('home')} aria-label="Trang chủ">
          <span className="logo-mark">LLQ</span>
          <span>
            <strong>Tiểu học Lạc Long Quân</strong>
            <small>Ươm mầm tri thức - Thắp sáng tương lai</small>
          </span>
        </button>

        <button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Mở menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Điều hướng chính">
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
        </nav>

        <button className="primary-pill" type="button" onClick={() => onNavigate('login')}>
          Đăng nhập
        </button>
      </div>
    </header>
  )
}

export default Header
