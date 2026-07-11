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
              <UploadCloud size={36} className="upload-icon" />
              <p className="dropzone-text-primary">Drag & drop homework</p>
              <p className="dropzone-text-secondary">JPG, PNG, PDF, or TXT (Max 5MB)</p>
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
                  <FileText size={24} className="file-doc-icon" />
                </div>
              )}
              <div className="file-details">
                <p className="file-name">{selectedFile.name}</p>
                <p className="file-size">{selectedFile.size}</p>
              </div>
              <button type="button" className="remove-file-btn" onClick={handleRemoveFile} title="Remove file">
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Text prompt text area */}
        <div className="text-prompt-container">
          <label htmlFor="assignment-text-area" className="prompt-label">
            Or type questions below:
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
          <span className="samples-label">Try these templates:</span>
          <div className="samples-btn-group">
            <button 
              type="button" 
              className="sample-btn" 
              onClick={() => setSampleInput('math')}
              disabled={isLoading}
            >
              📐 Math HW
            </button>
            <button 
              type="button" 
              className="sample-btn" 
              onClick={() => setSampleInput('history')}
              disabled={isLoading}
            >
              📜 Essay
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
              <span>Solving Homework...</span>
            </>
          ) : (
            <>
              <span>Solve & Write</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      <style>{`
        .upload-zone-container {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-sizing: border-box;
        }

        .upload-header h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .upload-header .subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .workspace-forms {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .dropzone {
          border: 2px dashed var(--text-primary);
          border-radius: var(--radius-sm);
          padding: 1.25rem;
          text-align: center;
          cursor: pointer;
          background-color: var(--bg-tertiary);
          transition: transform 0.1s, box-shadow 0.1s;
          min-height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .dropzone:hover, .dropzone.drag-active {
          background-color: var(--bg-primary);
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px var(--text-primary);
        }

        .dropzone.has-file {
          border-style: solid;
          cursor: default;
          background-color: var(--bg-secondary);
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        .file-input-hidden {
          display: none;
        }

        .dropzone-empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
        }

        .upload-icon {
          color: var(--text-secondary);
          margin-bottom: 0.15rem;
        }

        .dropzone-text-primary {
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .dropzone-text-secondary {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .browse-btn {
          margin-top: 0.4rem;
          padding: 0.35rem 0.85rem;
          background-color: var(--bg-secondary);
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 2px 2px 0px var(--text-primary);
          transition: transform 0.1s, box-shadow 0.1s;
        }

        .browse-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px var(--text-primary);
        }

        .dropzone-filled-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          position: relative;
        }

        .image-preview-wrapper {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background-color: var(--bg-primary);
          flex-shrink: 0;
          border: 2px solid var(--text-primary);
        }

        .image-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .file-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-color);
          flex-shrink: 0;
          border: 2px solid var(--text-primary);
        }

        .file-details {
          flex: 1;
          text-align: left;
          min-width: 0;
        }

        .file-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-size {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.1rem;
        }

        .remove-file-btn {
          background: var(--bg-primary);
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.3rem;
          border-radius: 50%;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        .remove-file-btn:hover {
          background-color: var(--error-color);
          color: #ffffff;
        }

        .text-prompt-container {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .prompt-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          text-align: left;
        }

        .prompt-textarea {
          width: 100%;
          height: 80px;
          padding: 0.6rem;
          background-color: var(--bg-primary);
          border: 2px solid var(--text-primary);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.85rem;
          line-height: 1.4;
          resize: none;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
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
          gap: 0.4rem;
        }

        .samples-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 700;
          text-align: left;
        }

        .samples-btn-group {
          display: flex;
          gap: 0.5rem;
        }

        .sample-btn {
          flex: 1;
          padding: 0.4rem 0.5rem;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          font-family: inherit;
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        .sample-btn:hover:not(:disabled) {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px var(--text-primary);
        }

        .sample-btn:active:not(:disabled) {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0px var(--text-primary);
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
          padding: 0.85rem;
          background-color: #fbbf24; /* Bright Retro Yellow */
          border: 2px solid var(--text-primary);
          color: #1e1e24; /* High contrast dark text */
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          box-shadow: 3px 3px 0px var(--text-primary);
          box-sizing: border-box;
          width: 100%;
        }

        .solve-workspace-btn:hover:not(:disabled) {
          transform: translate(-1.5px, -1.5px);
          box-shadow: 4.5px 4.5px 0px var(--text-primary);
          background-color: #f59e0b;
        }

        .solve-workspace-btn:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0px var(--text-primary);
        }

        .solve-workspace-btn:disabled {
          background: var(--bg-tertiary);
          color: var(--text-muted);
          cursor: not-allowed;
          box-shadow: none;
          opacity: 0.8;
          transform: none;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0, 0, 0, 0.15);
          border-top-color: #1e1e24;
          border-radius: 50%;
          animation: spin 0.8s infinite linear;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
