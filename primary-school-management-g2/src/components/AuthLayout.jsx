import ImageCard from './ImageCard'
import { image } from '../utils/images'

export function AuthField({ label, placeholder, type = 'text' }) {
  return (
    <label className="auth-field">
      {label}
      <input type={type} placeholder={placeholder} />
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
