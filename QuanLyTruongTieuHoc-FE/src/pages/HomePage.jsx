import ImageCard from '../components/ImageCard'
import SectionTitle from '../components/SectionTitle'
import { image } from '../utils/images'

function UtilityCard({ imageName, title, text, onClick }) {
  return (
    <article className="utility-card">
      <ImageCard src={image(imageName)} alt={title} />
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
        <button type="button" onClick={onClick}>Xem chi tiết →</button>
      </div>
    </article>
  )
}

function HomePage({ onNavigate }) {
  return (
    <>
      <section className="home-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>Chào mừng đến với ngôi nhà chung Lạc Long Quân</h1>
            <p>
              Nơi khơi dậy niềm đam mê học tập, rèn luyện nhân cách và trang bị hành trang vững chắc cho những bước đi đầu đời của các em học sinh.
            </p>
            <div className="hero-actions">
              <button className="gold-button" type="button" onClick={() => onNavigate('timetable')}>
                Xem Thời Khóa Biểu
              </button>
              <button className="outline-button" type="button" onClick={() => onNavigate('intro')}>
                Tìm hiểu thêm
              </button>
            </div>
          </div>
          <ImageCard src={image('AnhTruongHoc.jpg')} alt="Học sinh trước cổng trường Lạc Long Quân" className="hero-photo" />
        </div>
      </section>

      <section className="section">
        <SectionTitle title="Tiện ích tra cứu" subtitle="Dành cho Phụ huynh và Khách truy cập" />
        <div className="container utility-grid">
          <UtilityCard imageName="tracuuhocsinh.jpg" title="Tra cứu Học sinh" text="Xem thông tin cơ bản và thành tích học tập của học sinh." onClick={() => onNavigate('search')} />
          <UtilityCard imageName="doingugiaovien.jpg" title="Danh bạ Giáo viên" text="Tìm kiếm thông tin và liên hệ với đội ngũ cán bộ, giáo viên." onClick={() => onNavigate('search')} />
          <UtilityCard imageName="thoikhoabieu.jpg" title="Thời khóa biểu" text="Cập nhật lịch học mới nhất theo từng khối lớp và giáo viên." onClick={() => onNavigate('timetable')} />
        </div>
      </section>
    </>
  )
}

export default HomePage
