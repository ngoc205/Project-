import { useState, useEffect } from 'react'

import Footer from './components/Footer'
import Header from './components/Header'

import HomePage from './pages/HomePage'
import IntroPage from './pages/IntroPage'
import LoginPage from './pages/LoginPage'
import NewsPage from './pages/NewsPage'
import RegisterPage from './pages/RegisterPage'
import SearchPage from './pages/SearchPage'
import TimetablePage from './pages/TimetablePage'

import './App.css'

const authPages = ['login', 'register']

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

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    } else {
      setUser(null)
    }

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
        {page === 'register' && <RegisterPage onNavigate={changePage} />}
      </main>

      {!isAuthPage && <Footer />}
    </div>
  )
}

export default App