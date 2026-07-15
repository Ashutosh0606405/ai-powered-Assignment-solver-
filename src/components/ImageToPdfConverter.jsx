import React, { useState, useRef } from 'react';
import { Upload, Trash2, ArrowUp, ArrowDown, Plus, FileImage, Printer, AlertCircle } from 'lucide-react';

export default function ImageToPdfConverter() {
  const [images, setImages] = useState([]);
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
      file: file
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // Revoke URL to prevent memory leaks
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return filtered;
    });
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

  const generatePdf = () => {
    if (images.length === 0) return;
    window.print();
  };

  return (
    <div className="converter-workspace">
      <div className="converter-card glass-panel">
        <div className="converter-header">
          <div className="icon-badge">
            <FileImage size={24} />
          </div>
          <div>
            <h3>Image to PDF Compiler</h3>
            <p className="subtitle">Compile photos of your physical homework pages into a single PDF document.</p>
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
                    <img src={img.url} alt={img.name} />
                  </div>
                  
                  <div className="file-details">
                    <span className="file-name">{img.name}</span>
                    <span className="file-size">{img.size} MB</span>
                  </div>

                  <div className="action-buttons-group">
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
                <span>Make sure page scale is set to 'Fit to page' in browser print settings.</span>
              </div>

              <button className="compiler-btn-primary" onClick={generatePdf}>
                <Printer size={18} />
                <span>Create & Download PDF</span>
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

        .sort-btn, .delete-row-btn {
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

        .sort-btn:hover:not(:disabled), .delete-row-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        .sort-btn:active:not(:disabled), .delete-row-btn:active {
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
          background-color: rgba(251, 191, 36, 0.15);
          border: 2px solid var(--warning-color);
          border-radius: var(--radius-sm);
          color: var(--warning-color);
          font-size: 0.75rem;
          font-weight: 700;
          text-align: left;
        }

        .warning-icon {
          flex-shrink: 0;
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

        .compiler-btn-primary:hover {
          transform: translate(-1.5px, -1.5px);
          box-shadow: 5.5px 5.5px 0px var(--text-primary);
          background-color: var(--accent-hover);
        }

        .compiler-btn-primary:active {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0px var(--text-primary);
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

        /* Print formatting styles */
        @media print {
          .image-pdf-print-container {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #ffffff !important;
          }
          
          .print-image-page {
            page-break-after: always !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-image-page img {
            max-width: 100% !important;
            max-height: 100% !important;
            object-fit: contain !important;
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
