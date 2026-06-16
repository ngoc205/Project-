function ImageCard({ src, alt, className = '' }) {
  return (
    <div className={`image-frame ${className}`}>
      <img src={src} alt={alt} onError={(event) => { event.currentTarget.style.display = 'none' }} />
    </div>
  )
}

export default ImageCard
