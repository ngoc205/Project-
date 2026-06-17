import ImageCard from '../components/ImageCard'
import PageHero from '../components/PageHero'
import { news } from '../data/schoolData'
import { image } from '../utils/images'

function NewsPage() {
  return (
    <>
      <PageHero title="Tin tức & Sự kiện" subtitle="Cập nhật những thông tin mới nhất và những khoảnh khắc đáng nhớ tại Lạc Long Quân." />
      <section className="section">
        <div className="container">
          <div className="category-row">
            {['Tất cả', 'Thông báo', 'Hoạt động ngoại khóa', 'Gương sáng học đường', 'Góc phụ huynh'].map((item, index) => (
              <button className={index === 0 ? 'active' : ''} key={item} type="button">{item}</button>
            ))}
          </div>

          <article className="featured-news">
            <ImageCard src={image(news[0].image)} alt={news[0].title} />
            <div>
              <span>{news[0].date}</span>
              <h2>{news[0].title}</h2>
              <p>{news[0].lead}</p>
              <a href="#read-more">Xem chi tiết →</a>
            </div>
          </article>

          <div className="news-grid">
            {news.slice(1).map((item) => (
              <article className="news-card" key={item.title}>
                <div className="news-image">
                  <ImageCard src={image(item.image)} alt={item.title} />
                  <span>{item.category}</span>
                </div>
                <div>
                  <small>{item.date}</small>
                  <h3>{item.title}</h3>
                  <p>{item.lead}</p>
                  <a href="#read-more">Xem chi tiết →</a>
                </div>
              </article>
            ))}
          </div>
          <button className="outline-button more-button" type="button">Xem thêm bài viết</button>
        </div>
      </section>
    </>
  )
}

export default NewsPage
