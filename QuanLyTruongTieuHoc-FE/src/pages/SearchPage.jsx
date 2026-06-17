import ImageCard from '../components/ImageCard'
import { students } from '../data/schoolData'
import { image } from '../utils/images'

function SearchPage() {
  return (
    <>
      <section className="search-hero">
        <div className="container">
          <h1>Cổng tra cứu thông tin</h1>
          <p>Dành cho Phụ huynh và Khách truy cập</p>
          <span className="hero-watermark">Pattern</span>
        </div>
      </section>

      <section className="container search-panel-section">
        <div className="search-panel">
          <div className="tabs">
            <button className="active" type="button">Tra cứu Học sinh</button>
            <button type="button">Tra cứu Giáo viên</button>
          </div>
          <div className="search-form">
            <input type="search" placeholder="Nhập tên hoặc mã số..." />
            <select defaultValue="">
              <option value="" disabled>-- Chọn Khối --</option>
              <option>Khối 1</option>
              <option>Khối 2</option>
              <option>Khối 3</option>
            </select>
            <select defaultValue="">
              <option value="" disabled>-- Chọn Lớp --</option>
              <option>Lớp 1A1</option>
              <option>Lớp 1A2</option>
              <option>Lớp 2A1</option>
            </select>
            <button className="primary-button" type="button">Tìm kiếm</button>
          </div>
        </div>
      </section>

      <section className="container result-section">
        <h2>Kết quả tìm kiếm</h2>
        <p>Tìm thấy 2 kết quả phù hợp</p>
        <div className="result-grid">
          {students.map((student) => (
            <article className="student-card" key={student.id}>
              <ImageCard src={image(student.image)} alt={student.name} />
              <div>
                <h3>{student.name}</h3>
                <p>Mã HS: {student.id}</p>
                <p>Khối: {student.grade}</p>
                <p>GVCN: {student.teacher}</p>
                <span>Lớp {student.className}</span>
                <button className="outline-button compact" type="button">Xem điểm chi tiết</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default SearchPage
