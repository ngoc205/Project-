import { useEffect, useMemo, useState } from 'react'
import ImageCard from '../components/ImageCard'
import api from '../api/axiosClient'
import { useNotification } from '../components/NotificationProvider'

const fallbackImages = {
  student: '/images/hocsinh1.jpg',
  teacher: '/images/doingugiaovien.jpg',
}

function resolveImageSrc(value, type) {
  if (!value) return fallbackImages[type]
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) return value
  return `/images/${value}`
}

function formatDate(value) {
  if (!value) return 'Chưa cập nhật'
  return new Date(value).toLocaleDateString('vi-VN')
}

function SearchPage() {
  const { showError } = useNotification()
  const [mode, setMode] = useState('student')
  const [keyword, setKeyword] = useState('')
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const currentResults = mode === 'student' ? students : teachers

  const resultText = useMemo(() => {
    if (!searched) return 'Nhập mã hoặc tên để bắt đầu tra cứu'
    if (loading) return 'Đang tải dữ liệu...'
    return `Tìm thấy ${currentResults.length} kết quả phù hợp`
  }, [currentResults.length, loading, searched])

  const searchData = async (nextMode = mode, nextKeyword = keyword) => {
    setLoading(true)
    setSearched(true)

    const cleanKeyword = nextKeyword.trim()
    try {
      if (nextMode === 'student') {
        const res = cleanKeyword
          ? await api.get(`/hoc-sinh/search?keyword=${encodeURIComponent(cleanKeyword)}`)
          : await api.get('/hoc-sinh')
        setStudents(res.data)
      } else {
        const res = cleanKeyword
          ? await api.get(`/api/giaovien/search?keyword=${encodeURIComponent(cleanKeyword)}`)
          : await api.get('/api/giaovien')
        setTeachers(res.data)
      }
    } catch (err) {
      console.error('Lỗi tra cứu', err)
      showError('Không thể tải dữ liệu tra cứu từ database.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    searchData(mode, '')
  }, [mode])

  const handleSubmit = (event) => {
    event.preventDefault()
    searchData()
  }

  return (
    <>
      <section className="search-hero">
        <div className="container">
          <h1>Cổng tra cứu thông tin</h1>
          <p>Dữ liệu được lấy trực tiếp từ hệ thống quản lý nhà trường</p>
          <span className="hero-watermark">Pattern</span>
        </div>
      </section>

      <section className="container search-panel-section">
        <div className="search-panel">
          <div className="tabs">
            <button
              className={mode === 'student' ? 'active' : ''}
              type="button"
              onClick={() => {
                setMode('student')
                setKeyword('')
              }}
            >
              Tra cứu Học sinh
            </button>
            <button
              className={mode === 'teacher' ? 'active' : ''}
              type="button"
              onClick={() => {
                setMode('teacher')
                setKeyword('')
              }}
            >
              Tra cứu Giáo viên
            </button>
          </div>

          <form className="search-form" onSubmit={handleSubmit}>
            <input
              type="search"
              placeholder={mode === 'student' ? 'Nhập mã hoặc tên học sinh...' : 'Nhập mã, tên, SĐT hoặc tài khoản giáo viên...'}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </form>
        </div>
      </section>

      <section className="container result-section">
        <h2>Kết quả tìm kiếm</h2>
        <p>{resultText}</p>

        <div className="result-grid">
          {mode === 'student' && students.map((student) => (
            <article className="student-card" key={student.HocSinhID}>
              <ImageCard
                src={resolveImageSrc(student.AnhDaiDien, 'student')}
                alt={student.TenHocSinh}
              />
              <div>
                <h3>{student.TenHocSinh}</h3>
                <p>Mã HS: {student.HocSinhID}</p>
                <p>Ngày sinh: {formatDate(student.NgaySinh)}</p>
                <p>Giới tính: {student.GioiTinh || 'Chưa cập nhật'}</p>
                <p>Địa chỉ: {student.DiaChi || 'Chưa cập nhật'}</p>
                <span>{student.IsActive === false ? 'Tạm ngưng' : 'Đang học'}</span>
              </div>
            </article>
          ))}

          {mode === 'teacher' && teachers.map((teacher) => (
            <article className="student-card" key={teacher.GiaoVienID}>
              <ImageCard
                src={resolveImageSrc(teacher.AnhDaiDien, 'teacher')}
                alt={teacher.HoTen}
              />
              <div>
                <h3>{teacher.HoTen}</h3>
                <p>Mã GV: {teacher.GiaoVienID}</p>
                <p>Tài khoản: {teacher.TenDangNhap || 'Chưa gán'}</p>
                <p>SĐT: {teacher.SoDienThoai || 'Chưa cập nhật'}</p>
                <p>Địa chỉ: {teacher.DiaChi || 'Chưa cập nhật'}</p>
                <span>Chủ nhiệm: {teacher.LopChuNhiem || 'Chưa phân công'}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default SearchPage
