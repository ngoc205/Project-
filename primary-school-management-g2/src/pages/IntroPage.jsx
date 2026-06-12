import ImageCard from '../components/ImageCard'
import PageHero from '../components/PageHero'
import SectionTitle from '../components/SectionTitle'
import { coreValues } from '../data/schoolData'
import { image } from '../utils/images'

function IntroPage() {
  return (
    <>
      <PageHero title="Về Ngôi Nhà Lạc Long Quân" subtitle="Nơi ươm mầm những tài năng nhí, xây dựng nhân cách và tri thức từ những bước đi đầu tiên." />
      <section className="section intro-feature">
        <div className="container intro-grid">
          <div>
            <h2>Hành trình phát triển</h2>
            <p>
              Trường Tiểu học Lạc Long Quân được hình thành với khát vọng xây dựng một môi trường giáo dục toàn diện, nơi mỗi em học sinh được tôn trọng và phát triển theo năng lực riêng. Trải qua nhiều năm hoạt động, nhà trường tự hào là địa chỉ tin cậy của hàng ngàn phụ huynh trên địa bàn.
            </p>
            <div className="mini-card-grid">
              <div className="mini-card">
                <span>👁</span>
                <h3>Tầm nhìn</h3>
                <p>Trở thành ngôi trường tiểu học tiên phong trong đổi mới, chất lượng và phát triển nhân cách.</p>
              </div>
              <div className="mini-card">
                <span>🎯</span>
                <h3>Sứ mệnh</h3>
                <p>Trang bị cho học sinh nền tảng tri thức, kỹ năng sống và lòng nhân ái.</p>
              </div>
            </div>
          </div>
          <ImageCard src={image('AnhTruongHoc2.jpg')} alt="Tổng quan trường Lạc Long Quân" className="poster-card" />
        </div>
      </section>

      <section className="principal-band">
        <div className="container principal-card">
          <ImageCard src={image('Thayhieutruong.jpg')} alt="Thầy hiệu trưởng" />
          <div>
            <h2>Yêu thương và Thấu hiểu</h2>
            <p>
              Giáo dục tiểu học không chỉ dạy chữ, mà còn là rèn luyện một trái tim biết yêu thương. Tại Lạc Long Quân, chúng tôi không tạo ra áp lực thành tích, mà chúng tôi tạo ra động lực để các em mỗi ngày đều trưởng thành hơn.
            </p>
            <strong>Bùi Văn Chiến</strong>
            <small>Hiệu trưởng nhà trường</small>
          </div>
        </div>
      </section>

      <section className="section">
        <SectionTitle title="Giá trị cốt lõi" subtitle="Kim chỉ nam cho mọi hoạt động giáo dục tại trường" />
        <div className="container value-grid">
          {coreValues.map((value) => (
            <article className="value-card" key={value.title}>
              <ImageCard src={image(value.image)} alt={value.title} />
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default IntroPage
