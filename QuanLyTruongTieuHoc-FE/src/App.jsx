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
import ChiTietHocSinh from './pages/giaovien/ChiTietHocSinh'
import ThongTinCaNhan from './pages/giaovien/canhan'
import { NotificationProvider, useNotification } from './components/NotificationProvider'
import './App.css'


const authPages = ['login']
const teacherPages = ['teacher-dashboard', 'lop-chu-nhiem', 'diem', 'chi-tiet-hs', 'teacher-canhan']

const getSavedUser = () => {
  const savedUser = localStorage.getItem('user')
  return savedUser ? JSON.parse(savedUser) : null
}

function AppContent() {
  const { showError } = useNotification()
  const [page, setPage] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(getSavedUser)
  const [studentId, setStudentId] = useState(null)

  const isAuthPage = authPages.includes(page)

  const changePage = (nextPage, id = null) => {
    const currentUser = getSavedUser()
    setUser(currentUser)

    if (nextPage === 'chi-tiet-hs') {
      setStudentId(id)
    }

    if (nextPage.startsWith('admin-')) {
      if (!currentUser || currentUser.VaiTro !== 'CanBo') {
        showError('Truy cập bị từ chối: khu vực này chỉ dành cho cán bộ điều hành!')
        return
      }
    }

    if (teacherPages.includes(nextPage)) {
      if (!currentUser || currentUser.VaiTro !== 'GiaoVien') {
        showError('Truy cập bị từ chối: khu vực này chỉ dành cho giáo viên!')
        setPage('login')
        return
      }
    }

    setPage(nextPage)
    setMenuOpen(false)
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('vaiTro')
    setUser(null)
    setPage('home')
  }

  const teacherId = user?.TaiKhoanID || user?.id || user?.GiaoVienID || 3

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

        {page.startsWith('admin-') && <AdminDashboard page={page} onNavigate={changePage} />}

        {page === 'teacher-dashboard' && (
          <TeacherHomePage teacherId={teacherId} onLogout={handleLogout} />
        )}
        {page === 'lop-chu-nhiem' && (
          <LopChuNhiem teacherId={teacherId} onNavigate={changePage} />
        )}
        {page === 'diem' && <Diem teacherId={teacherId} onNavigate={changePage} />}
        {page === 'chi-tiet-hs' && (
          <ChiTietHocSinh hocSinhId={studentId} onNavigate={changePage} />
        )}
        {page === 'teacher-canhan' && (
          <ThongTinCaNhan 
            teacherId={user?.TaiKhoanID || user?.id || 3} 
            onNavigate={changePage} 
          />
        )}
      </main>

      {!isAuthPage && <Footer />}
    </div>
  )
}

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  )
}

export default App
