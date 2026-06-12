import { useState } from 'react'
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
  const isAuthPage = authPages.includes(page)

  const changePage = (nextPage) => {
    setPage(nextPage)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="site-shell">
      {!isAuthPage && (
        <Header
          activePage={page}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onNavigate={changePage}
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
