import React, { useState, useRef } from 'react';
import { Upload, Trash2, ArrowUp, ArrowDown, FileImage, Download, RotateCw, AlertCircle, Layers } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function ImageToPdfConverter() {
  const [images, setImages] = useState([]);
  const [fitMode, setFitMode] = useState('fit'); // 'fit' or 'fill'
  const [pageFormat, setPageFormat] = useState('a4'); // 'a4' or 'letter'
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const addFiles = (files) => {
    const validImageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validImageFiles.length === 0) {
      alert("Please select valid image files (PNG, JPG, JPEG).");
      return;
    }

    const newImages = validImageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2), // Convert to MB
      url: URL.createObjectURL(file),
      rotation: 0, // Initial rotation is 0 degrees
      file: file
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return filtered;
    });
  };

  const rotateImage = (id) => {
    setImages(prev => prev.map(img => {
      if (img.id === id) {
        return { ...img, rotation: (img.rotation + 90) % 360 };
      }
      return img;
    }));
  };

  const moveImage = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setImages(updated);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // Helper to rotate, crop, and convert image to optimized JPEG base64 URL
  const processImageCanvas = (imgObj) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imgObj.url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const rotation = imgObj.rotation || 0;

        // Determine canvas size based on rotation
        if (rotation === 90 || rotation === 270) {
          canvas.width = img.naturalHeight;
          canvas.height = img.naturalWidth;
        } else {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
        }

        // Draw rotated image
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        // Export as compressed JPEG
        const base64Data = canvas.toDataURL('image/jpeg', 0.85);
        resolve({
          dataUrl: base64Data,
          width: canvas.width,
          height: canvas.height
        });
      };
    });
  };

  const compileAndDownloadPdf = async () => {
    if (images.length === 0) return;
    setIsCompiling(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: pageFormat
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      for (let i = 0; i < images.length; i++) {
        setCompileProgress(`Processing page ${i + 1} of ${images.length}...`);
        
        if (i > 0) {
          doc.addPage();
        }

        const processed = await processImageCanvas(images[i]);

        let drawW = pageWidth;
        let drawH = pageHeight;
        let dx = 0;
        let dy = 0;

        if (fitMode === 'fit') {
          const pageRatio = pageWidth / pageHeight;
          const imgRatio = processed.width / processed.height;

          if (imgRatio > pageRatio) {
            // Image is wider than page
            drawW = pageWidth;
            drawH = pageWidth / imgRatio;
            dy = (pageHeight - drawH) / 2;
          } else {
            // Image is taller than page
            drawH = pageHeight;
            drawW = pageHeight * imgRatio;
            dx = (pageWidth - drawW) / 2;
          }
        }

        doc.addImage(processed.dataUrl, 'JPEG', dx, dy, drawW, drawH, undefined, 'FAST');
      }

      setCompileProgress("Saving PDF file...");
      doc.save('compiled_homework_assignment.pdf');
    } catch (e) {
      console.error(e);
      alert("An error occurred during PDF compilation.");
    } finally {
      setIsCompiling(false);
      setCompileProgress('');
    }
  };

  return (
    <div className="converter-workspace">
      <div className="converter-card glass-panel no-print">
        <div className="converter-header">
          <div className="icon-badge">
            <FileImage size={24} />
          </div>
          <div>
            <h3>Image to PDF Compiler</h3>
            <p className="subtitle">Compile photos of your physical homework pages into a single PDF document.</p>
          </div>
        </div>

        {/* Settings Card Row */}
        <div className="compiler-settings-row">
          <div className="settings-field">
            <label className="section-title"><Layers size={12} /> Paper Size</label>
            <div className="inline-presets">
              <button 
                type="button" 
                className={`preset-btn ${pageFormat === 'a4' ? 'active' : ''}`}
                onClick={() => setPageFormat('a4')}
              >
                A4 Paper
              </button>
              <button 
                type="button" 
                className={`preset-btn ${pageFormat === 'letter' ? 'active' : ''}`}
                onClick={() => setPageFormat('letter')}
              >
                Letter Size
              </button>
            </div>
          </div>

          <div className="settings-field">
            <label className="section-title">🖼️ Image Fit Mode</label>
            <div className="inline-presets">
              <button 
                type="button" 
                className={`preset-btn ${fitMode === 'fit' ? 'active' : ''}`}
                onClick={() => setFitMode('fit')}
                title="Fit image inside pages maintaining original proportions"
              >
                Fit Page
              </button>
              <button 
                type="button" 
                className={`preset-btn ${fitMode === 'fill' ? 'active' : ''}`}
                onClick={() => setFitMode('fill')}
                title="Stretch or cover the page fully"
              >
                Fill Page
              </button>
            </div>
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div 
          className="drop-zone-brutalist"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <Upload size={32} className="upload-icon" />
          <h4>Drag & Drop Photos Here</h4>
          <p>or click to browse your files (PNG, JPG, JPEG)</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            accept="image/*" 
            style={{ display: 'none' }}
          />
        </div>

        {images.length > 0 ? (
          <div className="image-list-container">
            <div className="list-header">
              <span>Selected Pages ({images.length})</span>
              <button className="clear-all-btn" onClick={() => setImages([])}>
                Remove All
              </button>
            </div>

            <div className="images-grid">
              {images.map((img, idx) => (
                <div key={img.id} className="image-row-item">
                  <div className="page-badge-index">{idx + 1}</div>
                  
                  <div className="preview-thumbnail">
                    <img 
                      src={img.url} 
                      alt={img.name} 
                      style={{ transform: `rotate(${img.rotation}deg)` }}
                    />
                  </div>
                  
                  <div className="file-details">
                    <span className="file-name">{img.name}</span>
                    <span className="file-size">{img.size} MB</span>
                  </div>

                  <div className="action-buttons-group">
                    <button 
                      className="rotate-btn"
                      onClick={() => rotateImage(img.id)}
                      title="Rotate 90° Clockwise"
                    >
                      <RotateCw size={14} />
                    </button>
                    <button 
                      className="sort-btn"
                      onClick={() => moveImage(idx, 'up')}
                      disabled={idx === 0}
                      title="Move Page Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button 
                      className="sort-btn"
                      onClick={() => moveImage(idx, 'down')}
                      disabled={idx === images.length - 1}
                      title="Move Page Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button 
                      className="delete-row-btn"
                      onClick={() => removeImage(img.id)}
                      title="Remove Page"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Print trigger card */}
            <div className="action-footer">
              <div className="warning-banner">
                <AlertCircle size={16} className="warning-icon" />
                <span>PDF will download directly to your device without using the print dialog.</span>
              </div>

              <button 
                className="compiler-btn-primary" 
                onClick={compileAndDownloadPdf}
                disabled={isCompiling}
              >
                {isCompiling ? (
                  <>
                    <div className="spinner-loader"></div>
                    <span>{compileProgress}</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Create & Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-uploader-state">
            <FileImage size={40} className="empty-icon" />
            <p>No photos uploaded yet. Upload snaps of your worksheets to start compiling.</p>
          </div>
        )}
      </div>

      <style>{`
        .converter-workspace {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 2.5rem;
          background-color: var(--bg-primary);
          overflow-y: auto;
          box-sizing: border-box;
        }

        .converter-card {
          width: 100%;
          max-width: 800px;
          height: fit-content;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background-color: var(--bg-secondary);
        }

        .converter-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-align: left;
        }

        .icon-badge {
          background-color: var(--accent-color);
          color: #ffffff;
          padding: 0.6rem;
          border-radius: var(--radius-sm);
          border: 2px solid var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        .converter-header h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.2rem;
        }

        .converter-header .subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .compiler-settings-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          text-align: left;
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .section-title {
          font-size: 0.75rem;
          font-weight: 850;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.35rem;
          text-transform: uppercase;
        }

        .inline-presets {
          display: flex;
          gap: 0.4rem;
        }

        .preset-btn {
          flex: 1;
          padding: 0.45rem;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        .preset-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px var(--text-primary);
          background-color: var(--bg-secondary);
        }

        .preset-btn.active {
          background-color: var(--accent-color);
          color: #ffffff;
        }

        .drop-zone-brutalist {
          border: 3px dashed var(--text-primary);
          border-radius: var(--radius-md);
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          cursor: pointer;
          background-color: var(--bg-tertiary);
          transition: background-color var(--transition-fast), transform var(--transition-fast);
        }

        .drop-zone-brutalist:hover {
          background-color: var(--bg-primary);
          transform: scale(0.995);
        }

        .upload-icon {
          color: var(--accent-color);
          margin-bottom: 0.25rem;
        }

        .drop-zone-brutalist h4 {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .drop-zone-brutalist p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .image-list-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-primary);
          border-bottom: 2px solid var(--text-primary);
          padding-bottom: 0.5rem;
        }

        .clear-all-btn {
          background: none;
          border: none;
          color: var(--error-color);
          font-weight: 800;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .clear-all-btn:hover {
          text-decoration: underline;
        }

        .images-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .image-row-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--text-primary);
          border-radius: var(--radius-sm);
          box-shadow: 3px 3px 0px var(--text-primary);
          position: relative;
          box-sizing: border-box;
          text-align: left;
        }

        .page-badge-index {
          background-color: var(--text-primary);
          color: var(--bg-primary);
          font-size: 0.75rem;
          font-weight: 900;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .preview-thumbnail {
          width: 50px;
          height: 50px;
          border: 1.5px solid var(--text-primary);
          border-radius: 4px;
          overflow: hidden;
          background-color: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .preview-thumbnail img {
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
          transition: transform 0.15s ease;
        }

        .file-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }

        .file-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-size {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .action-buttons-group {
          display: flex;
          gap: 0.35rem;
          flex-shrink: 0;
        }

        .rotate-btn, .sort-btn, .delete-row-btn {
          background-color: var(--bg-primary);
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.35rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.1s, box-shadow 0.1s;
        }

        .rotate-btn:hover, .sort-btn:hover:not(:disabled), .delete-row-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        .rotate-btn:active, .sort-btn:active:not(:disabled), .delete-row-btn:active {
          transform: translate(1px, 1px);
          box-shadow: none;
        }

        .sort-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .delete-row-btn {
          color: var(--error-color);
        }

        .action-footer {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .warning-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.8rem;
          background-color: rgba(52, 211, 153, 0.1);
          border: 2px solid var(--success-color);
          border-radius: var(--radius-sm);
          color: var(--success-color);
          font-size: 0.75rem;
          font-weight: 700;
          text-align: left;
        }

        .compiler-btn-primary {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem;
          background-color: var(--accent-color);
          border: 2px solid var(--text-primary);
          color: #ffffff;
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          box-shadow: 4px 4px 0px var(--text-primary);
          box-sizing: border-box;
        }

        .compiler-btn-primary:hover:not(:disabled) {
          transform: translate(-1.5px, -1.5px);
          box-shadow: 5.5px 5.5px 0px var(--text-primary);
          background-color: var(--accent-hover);
        }

        .compiler-btn-primary:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0px var(--text-primary);
        }

        .compiler-btn-primary:disabled {
          background-color: var(--bg-tertiary);
          color: var(--text-muted);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .spinner-loader {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-uploader-state {
          padding: 3rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-sm);
        }

        .empty-icon {
          color: var(--text-muted);
        }

        .empty-uploader-state p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          max-width: 320px;
        }
      `}</style>
    </div>
  );
}
