import React, { useState, useEffect } from 'react'
import './App.css'
import ImageViewer from './components/ImageViewer'
import ControlPanel from './components/ControlPanel'
import MixerControls from './components/MixerControls'
import useMainMixer from './utils/mainMixer'

function App() {
  // States
  const [images, setImages] = useState(Array(4).fill().map((_, i) => ({
    id: i, image: null, ftMode: 'magnitude',
    magWeight: 0.25, phaseWeight: 0.25
  })))
  
  const [commonSize, setCommonSize] = useState(null)
  const [loadedCount, setLoadedCount] = useState(0)

  // Mixer
  const mixer = useMainMixer()
  const { result, activeOutput, exportResult, setActiveOutput } = mixer

  // Effects
  useEffect(() => {
    const loaded = images.filter(img => img.image)
    setLoadedCount(loaded.length)
    
    if (loaded.length > 0) {
      const minW = Math.min(...loaded.map(img => img.size?.width || Infinity))
      const minH = Math.min(...loaded.map(img => img.size?.height || Infinity))
      setCommonSize(minW !== Infinity ? { width: minW, height: minH } : null)
    }
  }, [images])

  // Handlers
  const handleImageLoad = (id, imgData, fileName, imgSize) => {
    setImages(prev => prev.map((img, idx) => 
      idx === id ? { ...img, image: imgData, size: imgSize } : img
    ))
    mixer.updateImageWeights(id, 0.25, 0.25)
  }

  const handleImageClear = (id) => {
    setImages(prev => prev.map((img, idx) => 
      idx === id ? { ...img, image: null, size: null } : img
    ))
    mixer.updateImageWeights(id, 0, 0)
  }

  const handleFTChange = (id, newMode) => {
    setImages(prev => prev.map((img, idx) => 
      idx === id ? { ...img, ftMode: newMode } : img
    ))
  }

  const handleWeightChange = (id, type, value) => {
    const val = parseFloat(value)
    setImages(prev => prev.map((img, idx) => 
      idx === id ? {
        ...img,
        magWeight: type === 'magnitude' ? val : img.magWeight,
        phaseWeight: type === 'phase' ? val : img.phaseWeight
      } : img
    ))
    mixer.updateImageWeights(id,
      type === 'magnitude' ? val : images[id].magWeight,
      type === 'phase' ? val : images[id].phaseWeight
    )
  }

  const handleLoadSamples = () => {
    images.forEach((_, i) => {
      setTimeout(() => {
        const w = 300 + Math.floor(Math.random() * 100)
        const h = 300 + Math.floor(Math.random() * 100)
        
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        
        const gray = 50 + i * 40
        ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`
        ctx.fillRect(0, 0, w, h)
        
        ctx.fillStyle = `rgb(100, 150, 200)`
        ctx.fillRect(30, 30, w - 60, h - 60)
        
        ctx.fillStyle = 'white'
        ctx.font = 'bold 30px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`Sample ${i + 1}`, w / 2, h / 2)
        
        handleImageLoad(i, canvas.toDataURL('image/png'), `sample_${i + 1}.png`, { width: w, height: h })
      }, i * 200)
    })
  }

  const handleClearAll = () => {
    images.forEach((_, id) => handleImageClear(id))
  }

  const handleStartMixing = async () => {
    const loaded = images.filter(img => img.image)
    if (loaded.length < 2) {
      alert('Please load at least 2 images')
      return
    }
    await mixer.performMixing(loaded)
  }

  const handleUpdateRegion = (setting, value) => {
    mixer.updateRegionSettings(typeof setting === 'object' ? setting : { [setting]: value })
  }

  // Outputs
  const outputs = [0, 1].map(id => ({
    id,
    image: id === activeOutput && result ? exportResult() : null,
    active: id === activeOutput
  }))

  return (
    <div className="app">
      <header className="app-header">
        <h1><i className="fas fa-wave-square"></i> FT Image Mixer</h1>
      </header>

      {/* استخدم ControlPanel هنا */}
      <ControlPanel
        loadedCount={loadedCount}
        commonSize={commonSize}
        activeOutput={activeOutput}
        onLoadSamples={handleLoadSamples}
        onClearAll={handleClearAll}
      />

      <div className="main-content">
        {/* Left Panel */}
        <div className="left-panel">
          {/* Original Images */}
          <div className="original-images-row">
            {images.map(img => (
              <div key={`orig-${img.id}`} className="image-column">
                <div className="column-header">
                  <span>Image {img.id + 1}</span>
                </div>
                <ImageViewer 
                  id={img.id} 
                  image={img.image} 
                  isOutput={false} 
                  showFT={false}
                  onImageLoad={handleImageLoad} 
                  onImageClear={handleImageClear}
                />
                
                {img.image && (
                  <div className="weight-controls">
                    <div className="slider-group">
                      <div className="slider-label">
                        <span>M</span>
                        <span>{(img.magWeight * 100).toFixed(0)}%</span>
                      </div>
                      <input type="range" min="0" max="1" step="0.01" value={img.magWeight}
                        onChange={(e) => handleWeightChange(img.id, 'magnitude', e.target.value)}
                      />
                    </div>
                    <div className="slider-group">
                      <div className="slider-label">
                        <span>P</span>
                        <span>{(img.phaseWeight * 100).toFixed(0)}%</span>
                      </div>
                      <input type="range" min="0" max="1" step="0.01" value={img.phaseWeight}
                        onChange={(e) => handleWeightChange(img.id, 'phase', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* FT Viewers */}
          <div className="ft-viewers-row">
            {images.map(img => (
              <div key={`ft-${img.id}`} className="image-column">
                <div className="ft-controls">
                  <select value={img.ftMode} onChange={(e) => handleFTChange(img.id, e.target.value)}
                    disabled={!img.image} className="ft-select"
                  >
                    <option value="magnitude">Magnitude</option>
                    <option value="phase">Phase</option>
                    <option value="real">Real</option>
                    <option value="imaginary">Imaginary</option>
                  </select>
                </div>
                <ImageViewer 
                  id={img.id} 
                  image={img.image} 
                  isOutput={false} 
                  showFT={true} 
                  ftMode={img.ftMode}
                  onImageLoad={handleImageLoad} 
                  onImageClear={handleImageClear}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="mixer-panel">
            <h2><i className="fas fa-blender"></i> Mixer</h2>
            <MixerControls
              mixSettings={mixer.mixSettings}
              processing={mixer.processing}
              progress={mixer.progress}
              onUpdateRegion={handleUpdateRegion}
              onStartMixing={handleStartMixing}
              onCancel={mixer.cancelProcessing}
              activeOutput={activeOutput}
            />
          </div>

          <div className="outputs-panel">
            <h2><i className="fas fa-desktop"></i> Output</h2>
            <div className="outputs-grid">
              {outputs.map(output => (
                <div key={output.id} className="output-container">
                  <div className="output-header">
                    <span>Output {output.id + 1}</span>
                    {output.active && <span className="active-dot"></span>}
                  </div>
                  <ImageViewer 
                    id={output.id} 
                    image={output.image} 
                    isOutput={true} 
                    onActivate={setActiveOutput}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App