import React, { useRef } from 'react'
import './ImageViewer.css'

const ImageViewer = ({ 
  id, 
  image, 
  name, 
  size, 
  isOutput = false, 
  isActive = false,
  showFT = false,
  ftMode = 'magnitude',
  onImageLoad, 
  onImageClear,
  onActivate
}) => {
  const fileInputRef = useRef(null)

  const handleDoubleClick = () => {
    if (isOutput) {
      onActivate(id)
    } else {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        onImageLoad(id, event.target.result, file.name, {
          width: img.width,
          height: img.height
        })
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = null
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onImageClear(id)
  }

  // إنشاء صورة FT وهمية (للتوضيح فقط)
  const generateFTPreview = () => {
    if (!image) return null
    
    const img = new Image()
    img.src = image
    
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    
    // خلفية داكنة لمكونات FT
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // تلوين حسب نوع المكون
    let color, text, pattern
    switch(ftMode) {
      case 'magnitude':
        color = '#3498db'
        text = 'MAGNITUDE'
        pattern = 'radial'
        break
      case 'phase':
        color = '#2ecc71'
        text = 'PHASE'
        pattern = 'wave'
        break
      case 'real':
        color = '#e74c3c'
        text = 'REAL'
        pattern = 'horizontal'
        break
      case 'imaginary':
        color = '#9b59b6'
        text = 'IMAGINARY'
        pattern = 'vertical'
        break
      default:
        color = '#3498db'
        text = 'FT'
        pattern = 'radial'
    }
    
    // رسم نمط
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 2
    
    if (pattern === 'radial') {
      // دوائر متحدة المركز
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath()
        ctx.arc(canvas.width/2, canvas.height/2, i * 30, 0, Math.PI * 2)
        ctx.stroke()
      }
    } else if (pattern === 'wave') {
      // موجات
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x += 5) {
        const y = canvas.height/2 + Math.sin(x * 0.05) * 40
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    } else if (pattern === 'horizontal') {
      // خطوط أفقية
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    } else if (pattern === 'vertical') {
      // خطوط عمودية
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
    }
    
    // نص
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(text, canvas.width/2, canvas.height/2)
    
    return canvas.toDataURL('image/png')
  }

  const displayImage = showFT ? generateFTPreview() : image
  const hasImage = image !== null

  return (
    <div 
      className={`image-viewer ${isOutput ? 'output' : 'input'} ${isActive ? 'active' : ''} ${showFT ? 'ft-mode' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="viewer-container">
        {displayImage ? (
          <>
            <img 
              src={displayImage} 
              alt={name} 
              className="displayed-image"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
            <button 
              className="clear-btn"
              onClick={handleClear}
              title="Clear image"
            >
              <i className="fas fa-times"></i>
            </button>
          </>
        ) : (
          <div className="placeholder">
            <i className="fas fa-image"></i>
            <p>Double-click to {isOutput ? 'activate' : 'load image'}</p>
          </div>
        )}
      </div>

      {/* معلومات الصورة */}
      <div className="image-info">
        <div className="image-name">
          {name || (isOutput ? `Output ${id + 1}` : `Input ${id + 1}`)}
          {showFT && <span className="ft-mode-badge">{ftMode}</span>}
        </div>
        {size && (
          <div className="image-size">
            {size.width} × {size.height}
          </div>
        )}
      </div>

      {/* Input file مخفي */}
      {!isOutput && !showFT && (
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileChange}
        />
      )}
    </div>
  )
}

export default ImageViewer