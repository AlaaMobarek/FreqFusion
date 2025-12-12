import React from 'react'
import './MixerControls.css'

const MixerControls = ({
  mixSettings,
  processing,
  progress,
  onUpdateRegion,
  onStartMixing,
  onCancel,
  activeOutput
}) => {
  return (
    <div className="mixer-controls">
      {/* Region Settings */}
      <div className="control-section">
        <h3><i className="fas fa-border-style"></i> Region Selection</h3>
        
        <div className="region-type">
          <label>Select Region Type:</label>
          <div className="region-buttons">
            <button
              className={`region-btn ${mixSettings.regionSettings.type === 'inner' ? 'active' : ''}`}
              onClick={() => onUpdateRegion('type', 'inner')}
            >
              <i className="fas fa-square-full"></i> Inner Region
            </button>
            <button
              className={`region-btn ${mixSettings.regionSettings.type === 'outer' ? 'active' : ''}`}
              onClick={() => onUpdateRegion('type', 'outer')}
            >
              <i className="fas fa-border-all"></i> Outer Region
            </button>
          </div>
        </div>
        
        <div className="region-size">
          <label>Region Size: {mixSettings.regionSettings.size}%</label>
          <input
            type="range"
            min="10"
            max="90"
            step="5"
            value={mixSettings.regionSettings.size}
            onChange={(e) => onUpdateRegion('size', parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Active Output */}
      <div className="control-section">
        <h3><i className="fas fa-desktop"></i> Active Output</h3>
        <div className="output-selector">
          <button
            className={`output-btn ${activeOutput === 0 ? 'active' : ''}`}
            onClick={() => onUpdateRegion('activeOutput', 0)}
          >
            Output 1
          </button>
          <button
            className={`output-btn ${activeOutput === 1 ? 'active' : ''}`}
            onClick={() => onUpdateRegion('activeOutput', 1)}
          >
            Output 2
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {processing && (
        <div className="control-section">
          <h3><i className="fas fa-spinner fa-spin"></i> Processing</h3>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.round(progress)}%</span>
            <button 
              className="btn-cancel"
              onClick={onCancel}
            >
              <i className="fas fa-stop"></i> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Start Button */}
      <div className="action-section">
        <button
          className="btn-start"
          onClick={onStartMixing}
          disabled={processing}
        >
          <i className="fas fa-play"></i> Start Mixing
        </button>
      </div>
    </div>
  )
}

export default MixerControls