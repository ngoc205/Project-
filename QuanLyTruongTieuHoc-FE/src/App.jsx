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
import { NotificationProvider, useNotification } from './components/NotificationProvider'
import './App.css'

const authPages = ['login']

const getSavedUser = () => {
  const savedUser = localStorage.getItem('user')

  return savedUser ? JSON.parse(savedUser) : null
}

function AppContent() {
  const { showError } = useNotification()
  const [page, setPage] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(getSavedUser)

  const isAuthPage = authPages.includes(page)

  const changePage = (nextPage) => {
    const currentUser = getSavedUser()
    setUser(currentUser)

    if (nextPage.startsWith('admin-')) {
      if (!currentUser || currentUser.VaiTro !== 'CanBo') {
        showError('Truy cập bị từ chối: khu vực này chỉ dành cho cán bộ điều hành!')
        return
      }
    }

    if (nextPage.startsWith('teacher-')) {
      if (!currentUser || currentUser.VaiTro !== 'GiaoVien') {
        showError('Truy cập bị từ chối: khu vực này chỉ dành cho giáo viên!')
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
          <TeacherHomePage
            teacherId={user?.TaiKhoanID || user?.id || 3}
            onLogout={handleLogout}
          />
        )}
      </main>

      {!isAuthPage && <Footer />}
    </div>
  )
}

function App() {
  return <NotificationProvider><AppContent /></NotificationProvider>
}

export default App
