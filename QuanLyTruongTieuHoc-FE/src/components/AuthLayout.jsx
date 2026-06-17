import ImageCard from './ImageCard'
import { image } from '../utils/images'

export function AuthField({ label, placeholder, type = 'text', value, onChange }) {
  return (
    <label className="auth-field">
      {label}
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value}      // Thêm dòng này để React kiểm soát giá trị
        onChange={onChange} // Thêm dòng này để lắng nghe khi người dùng gõ
      />
    </label>
  )
}

function AuthLayout({ imageName, title, text, children }) {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-visual">
          <ImageCard src={image(imageName)} alt={title} />
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
        </div>
        <form className="auth-form">{children}</form>
      </div>
    </section>
  )
}

export default AuthLayout
