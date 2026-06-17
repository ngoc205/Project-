import { useState, useEffect } from 'react'

import Footer from './components/Footer'
import Header from './components/Header'

import HomePage from './pages/HomePage'
import IntroPage from './pages/IntroPage'
import LoginPage from './pages/LoginPage'
import NewsPage from './pages/NewsPage'
import AdminDashboard from './pages/AdminDashboard'
import SearchPage from './pages/SearchPage'
import TimetablePage from './pages/TimetablePage'
import TeacherDashboardPage from './pages/TeacherDashboardPage'
import './App.css'

const authPages = ['login']

function App() {
  const [page, setPage] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)

  const isAuthPage = authPages.includes(page)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const changePage = (nextPage) => {
    const savedUser = localStorage.getItem('user')
    let currentUser = null;

    if (savedUser) {
      currentUser = JSON.parse(savedUser)
      setUser(currentUser)
    } else {
      setUser(null)
    }

    // =========================================================
    // LỚP BẢO VỆ PHÂN QUYỀN (FRONTEND GUARD)
    // =========================================================
    
    // 1. Chặn người lạ hoặc Giáo viên vào khu vực Quản trị (Admin)
    if (nextPage.startsWith('admin-')) {
      if (!currentUser || currentUser.VaiTro !== 'CanBo') {
        alert('⛔ TRUY CẬP BỊ TỪ CHỐI: Khu vực này chỉ dành riêng cho Cán bộ điều hành!');
        return; // Hủy lệnh chuyển trang, đứng im tại chỗ
      }
    }

    // 2. Chặn người lạ hoặc Cán bộ vào khu vực cá nhân của Giáo viên
    if (nextPage.startsWith('teacher-')) {
      if (!currentUser || currentUser.VaiTro !== 'GiaoVien') {
        alert('⛔ TRUY CẬP BỊ TỪ CHỐI: Khu vực này chỉ dành cho Giáo viên!');
        return; 
      }
    }
    // =========================================================

    // Nếu qua được vòng kiểm duyệt, cho phép đổi trang
    setPage(nextPage)
    setMenuOpen(false)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('vaiTro') // Xóa quyền khi đăng xuất

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
        
        {/* TRANG DÀNH RIÊNG CHO GIÁO VIÊN */}
        {page === 'teacher-dashboard' && <TeacherDashboardPage />}
      </main>

      {!isAuthPage && <Footer />}
    </div>
  )
}

export default App