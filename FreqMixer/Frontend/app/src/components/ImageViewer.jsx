import React, { useRef } from "react";
import "./ImageViewer.css";

const ImageViewer = ({
  id,
  image,
  name,
  size,
  isOutput = false,
  isActive = false,
  onImageLoad,
  onImageClear,
  onActivate,
}) => {
  const fileInputRef = useRef(null);

  const handleDoubleClick = () => {
    if (isOutput) {
      onActivate(id);
    } else {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        onImageLoad(id, event.target.result, file.name, {
          width: img.width,
          height: img.height,
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = null;
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onImageClear(id);
  };

  return (
    <div
      className={`image-viewer ${isOutput ? "output" : "input"} ${
        isActive ? "active" : ""
      }`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="viewer-container">
        {image ? (
          <>
            <img
              src={image}
              alt={name}
              className="displayed-image"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
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
            <p>Double-click to {isOutput ? "activate" : "load image"}</p>
          </div>
        )}
      </div>

      <div className="image-info">
        <div className="image-name">
          {name || (isOutput ? `Output ${id + 1}` : `Input ${id + 1}`)}
        </div>
        {size && (
          <div className="image-size">
            {size.width} × {size.height}
          </div>
        )}
      </div>

      {!isOutput && (
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
};

export default ImageViewer;
