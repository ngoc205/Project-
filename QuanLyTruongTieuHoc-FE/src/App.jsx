import { useState } from 'react'
import Footer from './components/Footer'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import IntroPage from './pages/IntroPage'
import LoginPage from './pages/LoginPage'
import NewsPage from './pages/NewsPage'
import AdminDashboard from './pages/AdminDashboard'
import SearchPage from './pages/SearchPage'
import TimetablePage from './pages/TimetablePage'
import TeacherHomePage from './pages/giaovien/TeacherHomePage'
import LopChuNhiem from './pages/giaovien/lopchunhiem'
import Diem from './pages/giaovien/diem'
import ChiTietHocSinh from './pages/giaovien/ChiTietHocSinh' // Import trang chi tiết mới
import './App.css'

const authPages = ['login']

const getSavedUser = () => {
  const savedUser = localStorage.getItem('user')
  return savedUser ? JSON.parse(savedUser) : null
}

function App() {
  const [page, setPage] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(getSavedUser)
  const [studentId, setStudentId] = useState(null) // State để lưu ID học sinh cần xem chi tiết

  const isAuthPage = authPages.includes(page)

  const changePage = (nextPage, id = null) => {
    const currentUser = getSavedUser()
    setUser(currentUser)

    // Nếu chuyển sang trang chi tiết, lưu ID học sinh
    if (nextPage === 'chi-tiet-hs') {
        setStudentId(id);
    }

    if (['lop-chu-nhiem', 'diem', 'teacher-dashboard', 'chi-tiet-hs'].includes(nextPage)) {
      if (!currentUser || currentUser.VaiTro !== 'GiaoVien') {
        alert('TRUY CẬP BỊ TỪ CHỐI: Bạn cần đăng nhập bằng tài khoản Giáo viên!');
        setPage('login');
        return;
      }
    }
    
    if (nextPage.startsWith('admin-') && (!currentUser || currentUser.VaiTro !== 'CanBo')) {
        alert('Truy cập bị từ chối!')
        return
    }

    // Nếu qua được vòng kiểm duyệt, cho phép đổi trang
    setPage(nextPage)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogout = () => {
    localStorage.clear()
    setUser(null)
    setPage('home')
  }

  return (
    <div className="site-shell">
      {!isAuthPage && (
        <Header
          activePage={page}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onNavigate={changePage}
          user={user}
          onLogout={handleLogout}
        />
      )}

      <main>
        {page === 'home' && <HomePage onNavigate={changePage} />}
        {page === 'intro' && <IntroPage />}
        {page === 'search' && <SearchPage />}
        {page === 'timetable' && <TimetablePage />}
        {page === 'news' && <NewsPage />}
        {page === 'login' && <LoginPage onNavigate={changePage} />}
        
        {/* NẾU TRANG LÀ CỦA ADMIN, CHỈ CẦN GỌI ĐÚNG KHUNG DASHBOARD NÀY */}
        {/* Các trang con như admin-monhoc, admin-taikhoan sẽ được render tự động bên trong AdminDashboard */}
        {page.startsWith('admin-') && <AdminDashboard page={page} onNavigate={changePage} />}
          <LopChuNhiem teacherId={user?.TaiKhoanID || 3} onNavigate={changePage} />
        {page === 'diem' && (
          <Diem teacherId={user?.TaiKhoanID || 3} />
        )}
        {page === 'chi-tiet-hs' && (
          <ChiTietHocSinh hocSinhId={studentId} onNavigate={changePage} />
        )}

        {page.startsWith('admin-') && <AdminDashboard page={page} onNavigate={changePage} />}
      </main>

      {!isAuthPage && <Footer />}
    </div>
  )
}

export default App