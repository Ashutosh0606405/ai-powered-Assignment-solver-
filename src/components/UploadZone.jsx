import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, ArrowRight } from 'lucide-react';
import { fileToBase64 } from '../utils/gemini';

export default function UploadZone({ 
  onSolve, 
  isLoading, 
  selectedFile, 
  setSelectedFile, 
  textPrompt, 
  setTextPrompt 
}) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = async (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      alert("Unsupported file type. Please upload a JPEG, PNG, WEBP, PDF, or TXT file.");
      return;
    }

    try {
      const base64Data = await fileToBase64(file);
      setSelectedFile({
        fileObject: file,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        mimeType: file.type,
        base64: base64Data.base64,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      });
    } catch (err) {
      console.error("Error reading file:", err);
      alert("Error reading file. Please try again.");
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSolveClick = () => {
    if (!selectedFile && (!textPrompt || textPrompt.trim() === '')) {
      alert("Please upload an assignment file or type questions before solving.");
      return;
    }
    onSolve();
  };

  const setSampleInput = (type) => {
    if (type === 'math') {
      setTextPrompt("Solve the quadratic equation x^2 - 5x + 6 = 0, and show your step-by-step factoring work.");
    } else if (type === 'history') {
      setTextPrompt("Write a short essay on the main causes of the French Revolution (1789).");
    }
  };

  return (
    <div className="upload-zone-container glass-panel">
      <div className="upload-header">
        <h3>1. Input Your Assignment</h3>
        <p className="subtitle">Upload a photo/PDF of your homework or type it in directly.</p>
      </div>

      <div className="workspace-forms">
        {/* File Dropzone */}
        <div 
          className={`dropzone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="file-input-hidden"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,application/pdf,text/plain"
          />

          {!selectedFile ? (
            <div className="dropzone-empty-content">
              <UploadCloud size={40} className="upload-icon" />
              <p className="dropzone-text-primary">Drag & drop your homework here</p>
              <p className="dropzone-text-secondary">Supports JPG, PNG, PDF, or TXT (Max 5MB)</p>
              <button type="button" className="browse-btn">Browse Files</button>
            </div>
          ) : (
            <div className="dropzone-filled-content" onClick={(e) => e.stopPropagation()}>
              {selectedFile.previewUrl ? (
                <div className="image-preview-wrapper">
                  <img src={selectedFile.previewUrl} alt="Uploaded homework preview" className="image-preview" />
                </div>
              ) : (
                <div className="file-icon-wrapper">
                  <FileText size={48} className="file-doc-icon" />
                </div>
              )}
              <div className="file-details">
                <p className="file-name">{selectedFile.name}</p>
                <p className="file-size">{selectedFile.size}</p>
              </div>
              <button type="button" className="remove-file-btn" onClick={handleRemoveFile} title="Remove file">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Text prompt text area */}
        <div className="text-prompt-container">
          <label htmlFor="assignment-text-area" className="prompt-label">
            Or type questions / instructions below:
          </label>
          <textarea
            id="assignment-text-area"
            className="prompt-textarea"
            placeholder="Type your math equation, essay prompt, or instructions here..."
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Quick Help / Templates */}
        <div className="samples-container">
          <span className="samples-label">Try these sample prompts:</span>
          <div className="samples-btn-group">
            <button 
              type="button" 
              className="sample-btn" 
              onClick={() => setSampleInput('math')}
              disabled={isLoading}
            >
              📐 Math Homework
            </button>
            <button 
              type="button" 
              className="sample-btn" 
              onClick={() => setSampleInput('history')}
              disabled={isLoading}
            >
              📜 History Essay
            </button>
          </div>
        </div>

        {/* Solve Trigger Button */}
        <button 
          className={`solve-workspace-btn ${isLoading ? 'processing' : ''}`}
          onClick={handleSolveClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="spinner"></div>
              <span>Scanning & Solving Assignment...</span>
            </>
          ) : (
            <>
              <span>Solve & Write Assignment</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      <style>{`
        .upload-zone-container {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .upload-header h3 {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .upload-header .subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .workspace-forms {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .dropzone {
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.75rem;
          text-align: center;
          cursor: pointer;
          background-color: rgba(0, 0, 0, 0.15);
          transition: all var(--transition-fast);
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropzone:hover, .dropzone.drag-active {
          border-color: var(--accent-color);
          background-color: var(--accent-glow);
        }

        .dropzone.has-file {
          border-style: solid;
          cursor: default;
          background-color: var(--bg-tertiary);
        }

        .file-input-hidden {
          display: none;
        }

        .dropzone-empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .upload-icon {
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
          transition: transform var(--transition-normal);
        }

        .dropzone:hover .upload-icon {
          transform: translateY(-4px) scale(1.05);
          color: var(--accent-color);
        }

        .dropzone-text-primary {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .dropzone-text-secondary {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .browse-btn {
          margin-top: 0.5rem;
          padding: 0.4rem 1rem;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          font-family: var(--font-ui);
        }

        .dropzone-filled-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          position: relative;
        }

        .image-preview-wrapper {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background-color: var(--bg-primary);
          flex-shrink: 0;
          border: 1px solid var(--border-color);
        }

        .image-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .file-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-color);
          flex-shrink: 0;
          border: 1px solid var(--border-color);
        }

        .file-details {
          flex: 1;
          text-align: left;
          min-width: 0;
        }

        .file-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-size {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.1rem;
        }

        .remove-file-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.35rem;
          border-radius: 50%;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-file-btn:hover {
          background-color: var(--border-color);
          color: var(--error-color);
        }

        .text-prompt-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .prompt-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .prompt-textarea {
          width: 100%;
          height: 90px;
          padding: 0.75rem;
          background-color: rgba(0, 0, 0, 0.15);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-ui);
          font-size: 0.9rem;
          line-height: 1.4;
          resize: none;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .prompt-textarea:focus {
          border-color: var(--accent-color);
        }

        .prompt-textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .samples-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .samples-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .samples-btn-group {
          display: flex;
          gap: 0.5rem;
        }

        .sample-btn {
          padding: 0.4rem 0.75rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-ui);
        }

        .sample-btn:hover:not(:disabled) {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          border-color: var(--accent-color);
        }

        .sample-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .solve-workspace-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.9rem;
          background: linear-gradient(135deg, var(--accent-color), #7c3aed);
          border: none;
          color: #ffffff;
          border-radius: var(--radius-sm);
          font-family: var(--font-ui);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.25);
        }

        .solve-workspace-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
        }

        .solve-workspace-btn:disabled {
          background: var(--bg-tertiary);
          color: var(--text-muted);
          cursor: not-allowed;
          box-shadow: none;
          opacity: 0.8;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
