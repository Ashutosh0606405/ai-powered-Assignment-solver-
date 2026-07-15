import React, { useState, useRef } from 'react';
import { Upload, Trash2, ArrowUp, ArrowDown, FileImage, Download, RotateCw, Layers } from 'lucide-react';
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
      const uniqueId = Math.floor(100000 + Math.random() * 900000);
      doc.save(`new_pdf_${uniqueId}.pdf`);
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
      {/* Left Column: Settings and File Controls */}
      <div className="converter-control-sidebar glass-panel no-print">
        <div className="converter-header">
          <div className="icon-badge">
            <FileImage size={22} />
          </div>
          <div>
            <h3>PDF Compiler</h3>
            <p className="subtitle">Compile photos into a single PDF document.</p>
          </div>
        </div>

        {/* Settings Block */}
        <div className="compiler-settings-block">
          <div className="settings-field">
            <label className="section-title"><Layers size={11} /> Paper Size</label>
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
                title="Fit inside page retaining aspect ratio"
              >
                Fit Page
              </button>
              <button 
                type="button" 
                className={`preset-btn ${fitMode === 'fill' ? 'active' : ''}`}
                onClick={() => setFitMode('fill')}
                title="Stretch or crop to fill the page"
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
          <Upload size={24} className="upload-icon" />
          <h4>Drag & Drop Photos</h4>
          <p>or click to browse files</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            accept="image/*" 
            style={{ display: 'none' }}
          />
        </div>

        {images.length > 0 && (
          <button 
            className="compiler-btn-primary" 
            onClick={compileAndDownloadPdf}
            disabled={isCompiling}
          >
            {isCompiling ? (
              <>
                <div className="spinner-loader"></div>
                <span className="truncate">{compileProgress}</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Create & Download PDF</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Right Column: PDF Live Interactive Page Preview Gallery */}
      <div className="converter-preview-area">
        <div className="preview-area-header no-print">
          <h4>PDF Page Preview & Editing Workspace</h4>
          {images.length > 0 && (
            <button className="clear-all-btn-brutalist" onClick={() => setImages([])}>
              Clear All Pages
            </button>
          )}
        </div>

        {images.length > 0 ? (
          <div className="pages-preview-grid">
            {images.map((img, idx) => (
              <div 
                key={img.id} 
                className={`preview-sheet-page ${fitMode} ${pageFormat === 'letter' ? 'letter-ratio' : 'a4-ratio'}`}
              >
                {/* Visual Top Left Page Number Badge */}
                <div className="preview-page-badge">Page {idx + 1}</div>
                
                {/* Visual Title / Dimensions label */}
                <div className="preview-file-title-tag">{img.name}</div>
                
                {/* Image Drawing Viewport */}
                <div className="preview-image-viewport">
                  <img 
                    src={img.url} 
                    alt={`Page ${idx + 1}`} 
                    style={{ transform: `rotate(${img.rotation}deg)` }}
                  />
                </div>

                {/* Direct Editing Toolbar */}
                <div className="preview-page-controls no-print">
                  <button 
                    className="preview-ctrl-btn"
                    onClick={() => rotateImage(img.id)}
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw size={13} />
                  </button>
                  <button 
                    className="preview-ctrl-btn"
                    onClick={() => moveImage(idx, 'up')}
                    disabled={idx === 0}
                    title="Move Page Up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button 
                    className="preview-ctrl-btn"
                    onClick={() => moveImage(idx, 'down')}
                    disabled={idx === images.length - 1}
                    title="Move Page Down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button 
                    className="preview-ctrl-btn delete-btn"
                    onClick={() => removeImage(img.id)}
                    title="Delete Page"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-preview-state glass-panel">
            <FileImage size={48} className="empty-preview-icon" />
            <h4>No Pages Compiled Yet</h4>
            <p>Upload snaps of your worksheets in the left column. You will see A4/Letter page previews and can rotate, reorder, or delete them in real-time before generating your final PDF.</p>
          </div>
        )}
      </div>

      {/* Hidden Print Container */}
      <div className="image-pdf-print-container print-only">
        {images.map((img, idx) => (
          <div key={img.id} className="print-image-page">
            <img src={img.url} alt={`Page ${idx + 1}`} />
          </div>
        ))}
      </div>

      <style>{`
        .converter-workspace {
          flex: 1;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 2rem;
          padding: 2rem;
          background-color: var(--bg-primary);
          overflow: hidden;
          height: calc(100vh - 65px); /* Calculate height below header */
          box-sizing: border-box;
        }

        /* Left side control sidebar */
        .converter-control-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.5rem;
          background-color: var(--bg-secondary);
          height: 100%;
          overflow-y: auto;
          box-sizing: border-box;
          text-align: left;
        }

        .converter-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .icon-badge {
          background-color: var(--accent-color);
          color: #ffffff;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          border: 2px solid var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        .converter-header h3 {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.1rem;
        }

        .converter-header .subtitle {
          font-size: 0.7rem;
          color: var(--text-secondary);
          line-height: 1.3;
        }

        .compiler-settings-block {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .section-title {
          font-size: 0.7rem;
          font-weight: 850;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.3rem;
          text-transform: uppercase;
        }

        .inline-presets {
          display: flex;
          gap: 0.35rem;
        }

        .preset-btn {
          flex: 1;
          padding: 0.4rem;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          box-shadow: 2px 2px 0px var(--text-primary);
          font-family: inherit;
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
          border: 2px dashed var(--text-primary);
          border-radius: var(--radius-md);
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          cursor: pointer;
          background-color: var(--bg-tertiary);
          transition: background-color var(--transition-fast);
        }

        .drop-zone-brutalist:hover {
          background-color: var(--bg-primary);
        }

        .upload-icon {
          color: var(--accent-color);
        }

        .drop-zone-brutalist h4 {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .drop-zone-brutalist p {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .compiler-btn-primary {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: var(--accent-color);
          border: 2px solid var(--text-primary);
          color: #ffffff;
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          box-shadow: 3px 3px 0px var(--text-primary);
          box-sizing: border-box;
          margin-top: auto;
          flex-shrink: 0;
        }

        .compiler-btn-primary:hover:not(:disabled) {
          transform: translate(-1.5px, -1.5px);
          box-shadow: 4.5px 4.5px 0px var(--text-primary);
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

        /* Right side preview panel */
        .converter-preview-area {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          height: 100%;
          overflow: hidden;
          box-sizing: border-box;
        }

        .preview-area-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid var(--text-primary);
          padding-bottom: 0.5rem;
          flex-shrink: 0;
        }

        .preview-area-header h4 {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .clear-all-btn-brutalist {
          background-color: var(--bg-secondary);
          border: 2px solid var(--text-primary);
          color: var(--error-color);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 2px 2px 0px var(--text-primary);
          transition: transform 0.1s, box-shadow 0.1s;
        }

        .clear-all-btn-brutalist:hover {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px var(--text-primary);
          background-color: var(--bg-tertiary);
        }

        .clear-all-btn-brutalist:active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0px var(--text-primary);
        }

        .pages-preview-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.5rem;
          overflow-y: auto;
          padding: 0.5rem 0.5rem 2rem 0.5rem;
          box-sizing: border-box;
        }

        /* Realistic Mini A4 / Letter Page representation */
        .preview-sheet-page {
          width: 100%;
          background-color: #ffffff;
          border: 2px solid var(--text-primary);
          box-shadow: 5px 5px 0px var(--text-primary);
          border-radius: var(--radius-sm);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          height: fit-content;
        }

        .a4-ratio {
          aspect-ratio: 1 / 1.414;
        }

        .letter-ratio {
          aspect-ratio: 8.5 / 11;
        }

        .preview-page-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background-color: var(--text-primary);
          color: var(--bg-primary);
          font-size: 0.6rem;
          font-weight: 900;
          padding: 0.15rem 0.4rem;
          border-radius: 3px;
          z-index: 10;
          text-transform: uppercase;
        }

        .preview-file-title-tag {
          position: absolute;
          top: 8px;
          right: 8px;
          background-color: rgba(255, 255, 255, 0.85);
          border: 1px solid var(--text-primary);
          color: var(--text-primary);
          font-size: 0.55rem;
          font-weight: 700;
          padding: 0.1rem 0.35rem;
          border-radius: 2px;
          max-width: 90px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          z-index: 10;
        }

        .preview-image-viewport {
          flex: 1;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          background-color: #e2e8f0;
          padding: 10px;
          box-sizing: border-box;
          position: relative;
        }

        /* Fit vs Fill configurations visually wowed in mini pages */
        .preview-sheet-page.fit .preview-image-viewport img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .preview-sheet-page.fill .preview-image-viewport img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-image-viewport img {
          transition: transform 0.15s ease-in-out;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        /* Editing Toolbar on each page */
        .preview-page-controls {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background-color: var(--bg-secondary);
          border-top: 2px solid var(--text-primary);
          z-index: 10;
        }

        .preview-ctrl-btn {
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

        .preview-ctrl-btn:hover:not(:disabled) {
          transform: translate(-1px, -1px);
          box-shadow: 1.5px 1.5px 0px var(--text-primary);
        }

        .preview-ctrl-btn:active:not(:disabled) {
          transform: translate(1px, 1px);
          box-shadow: none;
        }

        .preview-ctrl-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .preview-ctrl-btn.delete-btn {
          color: var(--error-color);
          margin-left: auto; /* Push delete to the right */
        }

        .empty-preview-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          gap: 1rem;
          text-align: center;
          max-width: 500px;
          margin: 4rem auto;
          box-sizing: border-box;
          height: fit-content;
        }

        .empty-preview-icon {
          color: var(--text-muted);
          animation: float 4s ease-in-out infinite;
        }

        .empty-preview-state h4 {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .empty-preview-state p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .spinner-loader {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .image-pdf-print-container {
          display: none;
        }
      `}</style>
    </div>
  );
}
