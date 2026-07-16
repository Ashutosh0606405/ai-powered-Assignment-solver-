import React, { useState, useRef } from 'react';
import { Upload, Trash2, ArrowUp, ArrowDown, FileText, Download, Scissors, Combine, Info, Edit } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { solveAssignment, fileToBase64 } from '../utils/gemini';

export default function PdfEditor({ apiKey, setSolutionText, setActiveTab }) {
  const [activeTool, setActiveTool] = useState('merge'); // 'merge', 'split', or 'edit'
  const [mergeFiles, setMergeFiles] = useState([]);
  const [splitFile, setSplitFile] = useState(null);
  const [splitRange, setSplitRange] = useState('');
  
  // States for the new PDF AI Editor/Handwriting converter
  const [editFile, setEditFile] = useState(null);
  const [editInstruction, setEditInstruction] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');

  const mergeInputRef = useRef(null);
  const splitInputRef = useRef(null);
  const editInputRef = useRef(null);

  // Handle PDF Uploads for Merging
  const handleMergeFilesChange = (e) => {
    const files = Array.from(e.target.files);
    addMergeFiles(files);
  };

  const addMergeFiles = (files) => {
    const validPdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (validPdfFiles.length === 0) {
      alert("Please upload valid PDF files.");
      return;
    }

    const newFiles = validPdfFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
      file: file
    }));

    setMergeFiles(prev => [...prev, ...newFiles]);
  };

  const removeMergeFile = (id) => {
    setMergeFiles(prev => prev.filter(f => f.id !== id));
  };

  const moveMergeFile = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...mergeFiles];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setMergeFiles(updated);
  };

  // Handle PDF Upload for Splitting
  const handleSplitFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSplitFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2),
        file: file
      });
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  // Handle PDF Upload for AI Editing/Handwriting
  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setEditFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2),
        file: file
      });
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  // Perform PDF Merge using pdf-lib
  const runMergePdf = async () => {
    if (mergeFiles.length < 2) {
      alert("Please upload at least 2 PDF files to merge.");
      return;
    }
    setIsProcessing(true);
    setProcessStatus("Merging PDF documents...");

    try {
      const mergedPdf = await PDFDocument.create();

      for (const fileObj of mergeFiles) {
        setProcessStatus(`Reading ${fileObj.name}...`);
        const fileBytes = await fileObj.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      setProcessStatus("Compiling final document...");
      const mergedPdfBytes = await mergedPdf.save();
      
      // Download merged file
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const uniqueId = Math.floor(100000 + Math.random() * 900000);
      a.download = `merged_pdf_${uniqueId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error occurred while merging PDF files.");
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // Perform PDF Split/Page Extraction using pdf-lib
  const runSplitPdf = async () => {
    if (!splitFile) {
      alert("Please upload a PDF file first.");
      return;
    }

    if (!splitRange.trim()) {
      alert("Please enter a valid page range (e.g. 1-3, 5).");
      return;
    }

    setIsProcessing(true);
    setProcessStatus("Extracting selected pages...");

    try {
      const fileBytes = await splitFile.file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(fileBytes);
      const totalPages = sourcePdf.getPageCount();

      // Parse range: e.g. "1-3, 5" -> [0, 1, 2, 4] (0-indexed)
      const pagesToKeep = [];
      const parts = splitRange.split(',');

      parts.forEach(part => {
        const cleanPart = part.trim();
        if (cleanPart.includes('-')) {
          const [start, end] = cleanPart.split('-').map(num => parseInt(num.trim(), 10));
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= totalPages) pagesToKeep.push(i - 1);
            }
          }
        } else {
          const pageNum = parseInt(cleanPart, 10);
          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            pagesToKeep.push(pageNum - 1);
          }
        }
      });

      if (pagesToKeep.length === 0) {
        alert(`No valid pages selected. The PDF only has ${totalPages} pages.`);
        setIsProcessing(false);
        return;
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(sourcePdf, pagesToKeep);
      copiedPages.forEach((page) => newPdf.addPage(page));

      setProcessStatus("Compiling extracted pages...");
      const newPdfBytes = await newPdf.save();

      // Download split file
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const uniqueId = Math.floor(100000 + Math.random() * 900000);
      a.download = `extracted_pages_${uniqueId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error occurred while extracting PDF pages. Please verify your range.");
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // Perform AI Edit/Rewrite to Handwriting using Gemini
  const runAiEditPdf = async () => {
    if (!editFile) {
      alert("Please upload a typed PDF document first.");
      return;
    }

    setIsProcessing(true);
    setProcessStatus("Analyzing and rewriting document with Gemini...");

    try {
      // 1. Convert PDF to base64
      const fileData = await fileToBase64(editFile.file);

      // 2. Formulate prompt instruction
      const defaultPrompt = "Extract all text content from this typed PDF document and rewrite it as a natural, clean, human-like student homework answer sheet. Simplify paragraphs, expand steps where useful, and ensure it fits a neat handwritten notebook sheet structure.";
      const prompt = editInstruction.trim() ? editInstruction.trim() : defaultPrompt;

      // 3. Solve using Gemini API
      const solution = await solveAssignment(
        {
          base64: fileData.base64,
          mimeType: 'application/pdf',
          name: editFile.name
        },
        prompt,
        apiKey
      );

      // 4. Load into workspace and switch view
      setSolutionText(solution);
      setActiveTab('workspace');
    } catch (e) {
      console.error(e);
      alert(`AI Conversion Error: ${e.message || "Failed to process PDF content. Please check your Gemini connection."}`);
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  return (
    <div className="pdf-editor-workspace">
      {/* Left side sidebar selector */}
      <div className="pdf-editor-sidebar glass-panel no-print">
        <div className="editor-header">
          <div className="icon-badge">
            <Scissors size={20} />
          </div>
          <div>
            <h3>PDF Editor</h3>
            <p className="subtitle">Merge multiple files, extract pages, or convert typed PDFs to handwriting.</p>
          </div>
        </div>

        {/* Tool selectors */}
        <div className="tool-selector-block">
          <button 
            className={`tool-selector-btn ${activeTool === 'merge' ? 'active' : ''}`}
            onClick={() => setActiveTool('merge')}
          >
            <Combine size={16} />
            <span>Merge & Combine PDFs</span>
          </button>
          <button 
            className={`tool-selector-btn ${activeTool === 'split' ? 'active' : ''}`}
            onClick={() => setActiveTool('split')}
          >
            <Scissors size={16} />
            <span>Split & Extract Pages</span>
          </button>
          <button 
            className={`tool-selector-btn ${activeTool === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTool('edit')}
          >
            <Edit size={16} />
            <span>AI Edit to Handwriting</span>
          </button>
        </div>

        {/* Informative Tip */}
        <div className="help-box">
          <Info size={14} className="help-icon" />
          <p>
            {activeTool === 'merge' && "Upload multiple PDFs (e.g. your cover page and solved worksheet) and join them into a single file."}
            {activeTool === 'split' && "Upload a PDF document and specify which page numbers to save. Great for isolating a single solved page."}
            {activeTool === 'edit' && "Upload a typed PDF document. Gemini AI will analyze its text and automatically rewrite it into a human-like handwritten sheet in your workspace."}
          </p>
        </div>
      </div>

      {/* Right side editor interface */}
      <div className="pdf-editor-content">
        {activeTool === 'merge' && (
          /* PDF Merger Interface */
          <div className="editor-tool-panel glass-panel">
            <h4>1. Upload PDF Files to Merge</h4>
            
            <div 
              className="drop-zone-pdf"
              onClick={() => mergeInputRef.current.click()}
            >
              <Upload size={28} className="upload-icon" />
              <h5>Browse PDF Files</h5>
              <p>Upload files to merge into a single PDF document</p>
              <input 
                type="file" 
                ref={mergeInputRef} 
                onChange={handleMergeFilesChange} 
                multiple 
                accept="application/pdf" 
                style={{ display: 'none' }}
              />
            </div>

            {mergeFiles.length > 0 ? (
              <div className="merge-list-wrapper">
                <div className="merge-list-header">
                  <span>File Order ({mergeFiles.length})</span>
                  <button className="clear-all-btn" onClick={() => setMergeFiles([])}>
                    Clear List
                  </button>
                </div>

                <div className="merge-files-list">
                  {mergeFiles.map((fileObj, idx) => (
                    <div key={fileObj.id} className="merge-file-row">
                      <div className="file-index-badge">{idx + 1}</div>
                      
                      <div className="file-icon-badge">
                        <FileText size={18} />
                      </div>

                      <div className="file-info-col">
                        <span className="file-title">{fileObj.name}</span>
                        <span className="file-meta">{fileObj.size} MB</span>
                      </div>

                      <div className="file-action-buttons">
                        <button 
                          className="action-icon-btn"
                          onClick={() => moveMergeFile(idx, 'up')}
                          disabled={idx === 0}
                          title="Move File Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button 
                          className="action-icon-btn"
                          onClick={() => moveMergeFile(idx, 'down')}
                          disabled={idx === mergeFiles.length - 1}
                          title="Move File Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button 
                          className="action-icon-btn delete-btn"
                          onClick={() => removeMergeFile(fileObj.id)}
                          title="Delete File"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  className="execute-btn-brutalist"
                  onClick={runMergePdf}
                  disabled={isProcessing || mergeFiles.length < 2}
                >
                  {isProcessing ? (
                    <>
                      <div className="spinner"></div>
                      <span>{processStatus}</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>Merge & Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="empty-tool-state">
                <FileText size={40} className="empty-icon" />
                <p>No PDF files uploaded yet. Add files to see them here.</p>
              </div>
            )}
          </div>
        )}

        {activeTool === 'split' && (
          /* PDF Page Splitter Interface */
          <div className="editor-tool-panel glass-panel">
            <h4>1. Upload PDF File to Split</h4>

            <div 
              className="drop-zone-pdf"
              onClick={() => splitInputRef.current.click()}
            >
              <Upload size={28} className="upload-icon" />
              <h5>Select PDF File</h5>
              <p>Upload a PDF document to extract pages</p>
              <input 
                type="file" 
                ref={splitInputRef} 
                onChange={handleSplitFileChange} 
                accept="application/pdf" 
                style={{ display: 'none' }}
              />
            </div>

            {splitFile ? (
              <div className="split-controls-wrapper">
                <div className="selected-file-card">
                  <div className="file-icon-badge">
                    <FileText size={18} />
                  </div>
                  <div className="file-info-col">
                    <span className="file-title">{splitFile.name}</span>
                    <span className="file-meta">{splitFile.size} MB</span>
                  </div>
                  <button className="delete-row-btn" onClick={() => setSplitFile(null)}>
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="split-range-input-card">
                  <label className="range-label">Extract Page Numbers</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 1, 3, 5-8 (pages numbers separated by commas)"
                    value={splitRange}
                    onChange={(e) => setSplitRange(e.target.value)}
                    className="range-textbox"
                  />
                  <span className="range-tip">Use commas for individual pages, and hyphens for page ranges (e.g. 1-4).</span>
                </div>

                <button 
                  className="execute-btn-brutalist"
                  onClick={runSplitPdf}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="spinner"></div>
                      <span>{processStatus}</span>
                    </>
                  ) : (
                    <>
                      <Scissors size={18} />
                      <span>Extract & Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="empty-tool-state">
                <FileText size={40} className="empty-icon" />
                <p>No PDF uploaded. Upload a document to set splitting ranges.</p>
              </div>
            )}
          </div>
        )}

        {activeTool === 'edit' && (
          /* PDF AI Handwriting Editor Interface */
          <div className="editor-tool-panel glass-panel">
            <h4>1. Upload Typed PDF to Convert to Handwriting</h4>

            <div 
              className="drop-zone-pdf"
              onClick={() => editInputRef.current.click()}
            >
              <Upload size={28} className="upload-icon" />
              <h5>Select PDF File</h5>
              <p>Upload a typed or scanned PDF document to handwrite</p>
              <input 
                type="file" 
                ref={editInputRef} 
                onChange={handleEditFileChange} 
                accept="application/pdf" 
                style={{ display: 'none' }}
              />
            </div>

            {editFile ? (
              <div className="split-controls-wrapper">
                <div className="selected-file-card">
                  <div className="file-icon-badge">
                    <FileText size={18} />
                  </div>
                  <div className="file-info-col">
                    <span className="file-title">{editFile.name}</span>
                    <span className="file-meta">{editFile.size} MB</span>
                  </div>
                  <button className="delete-row-btn" onClick={() => setEditFile(null)}>
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="split-range-input-card">
                  <label className="range-label">Custom Formatting Instruction (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Summarize the text, rewrite neatly, solve the questions..."
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    className="range-textbox"
                  />
                  <span className="range-tip">Leave blank to do a straight conversion, or provide rules for Gemini to edit the text while rewriting.</span>
                </div>

                <button 
                  className="execute-btn-brutalist"
                  onClick={runAiEditPdf}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="spinner"></div>
                      <span>{processStatus}</span>
                    </>
                  ) : (
                    <>
                      <Edit size={18} />
                      <span>Convert & Edit in Workspace</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="empty-tool-state">
                <FileText size={40} className="empty-icon" />
                <p>No PDF uploaded. Add a typed assignment to convert it into human-like handwriting.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .pdf-editor-workspace {
          flex: 1;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 2rem;
          padding: 2rem;
          background-color: transparent !important;
          overflow: hidden;
          height: calc(100vh - 65px);
          box-sizing: border-box;
        }

        .pdf-editor-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.5rem;
          background-color: var(--glass-bg) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          height: 100%;
          overflow-y: auto;
          box-sizing: border-box;
          text-align: left;
        }

        .editor-header {
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

        .editor-header h3 {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.1rem;
        }

        .editor-header .subtitle {
          font-size: 0.7rem;
          color: var(--text-secondary);
          line-height: 1.3;
        }

        .tool-selector-block {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .tool-selector-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          box-shadow: 2px 2px 0px var(--text-primary);
          font-family: inherit;
          text-align: left;
        }

        .tool-selector-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px var(--text-primary);
          background-color: var(--bg-secondary);
        }

        .tool-selector-btn.active {
          background-color: var(--accent-color);
          color: #ffffff;
        }

        .help-box {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: var(--bg-tertiary);
          border-left: 3.5px solid var(--accent-color);
          border-radius: 4px;
        }

        .help-icon {
          color: var(--accent-color);
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .help-box p {
          font-size: 0.72rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
        }

        /* Right side content tool layout */
        .pdf-editor-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          box-sizing: border-box;
        }

        .editor-tool-panel {
          flex: 1;
          background-color: var(--bg-secondary);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          overflow-y: auto;
          box-sizing: border-box;
          text-align: left;
        }

        .editor-tool-panel h4 {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
          border-bottom: 2px solid var(--text-primary);
          padding-bottom: 0.5rem;
        }

        .drop-zone-pdf {
          border: 3px dashed var(--text-primary);
          border-radius: var(--radius-md);
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          background-color: var(--bg-tertiary);
          transition: background-color var(--transition-fast);
        }

        .drop-zone-pdf:hover {
          background-color: var(--bg-primary);
        }

        .upload-icon {
          color: var(--accent-color);
        }

        .drop-zone-pdf h5 {
          font-size: 0.9rem;
          font-weight: 850;
          color: var(--text-primary);
          margin: 0;
        }

        .drop-zone-pdf p {
          font-size: 0.72rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .merge-list-wrapper, .split-controls-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .merge-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-primary);
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

        .merge-files-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          max-height: 280px;
          overflow-y: auto;
          padding-right: 0.2rem;
        }

        .merge-file-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.65rem;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--text-primary);
          border-radius: var(--radius-sm);
          box-shadow: 2px 2px 0px var(--text-primary);
          box-sizing: border-box;
        }

        .file-index-badge {
          background-color: var(--text-primary);
          color: var(--bg-primary);
          font-size: 0.7rem;
          font-weight: 900;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .file-icon-badge {
          color: var(--accent-color);
          flex-shrink: 0;
        }

        .file-info-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          min-width: 0;
          text-align: left;
        }

        .file-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-meta {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .file-action-buttons {
          display: flex;
          gap: 0.3rem;
          flex-shrink: 0;
        }

        .action-icon-btn {
          background-color: var(--bg-primary);
          border: 1.5px solid var(--text-primary);
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.3rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-icon-btn:hover:not(:disabled) {
          background-color: var(--bg-secondary);
        }

        .action-icon-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .action-icon-btn.delete-btn {
          color: var(--error-color);
        }

        .selected-file-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.65rem;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--text-primary);
          border-radius: var(--radius-sm);
          box-shadow: 2px 2px 0px var(--text-primary);
          box-sizing: border-box;
        }

        .delete-row-btn {
          background-color: var(--bg-primary);
          border: 2px solid var(--text-primary);
          color: var(--error-color);
          cursor: pointer;
          padding: 0.3rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .split-range-input-card {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          text-align: left;
        }

        .range-label {
          font-size: 0.75rem;
          font-weight: 850;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .range-textbox {
          padding: 0.6rem;
          background-color: var(--bg-primary);
          border: 2px solid var(--text-primary);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-code);
          font-size: 0.85rem;
          outline: none;
          box-shadow: 2px 2px 0px var(--text-primary);
          box-sizing: border-box;
          transition: border-color var(--transition-fast);
        }

        .range-textbox:focus {
          border-color: var(--accent-color);
        }

        .range-tip {
          font-size: 0.68rem;
          color: var(--text-muted);
          line-height: 1.3;
        }

        .execute-btn-brutalist {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.8rem;
          background-color: var(--accent-color);
          border: 2px solid var(--text-primary);
          color: #ffffff;
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          box-shadow: 3.5px 3.5px 0px var(--text-primary);
          box-sizing: border-box;
        }

        .execute-btn-brutalist:hover:not(:disabled) {
          transform: translate(-1.5px, -1.5px);
          box-shadow: 5px 5px 0px var(--text-primary);
          background-color: var(--accent-hover);
        }

        .execute-btn-brutalist:active:not(:disabled) {
          transform: translate(1.5px, 1.5px);
          box-shadow: 1px 1px 0px var(--text-primary);
        }

        .execute-btn-brutalist:disabled {
          background-color: var(--bg-tertiary);
          color: var(--text-muted);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .empty-tool-state {
          padding: 4rem 1rem;
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

        .empty-tool-state p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          max-width: 320px;
          margin: 0;
        }

        .spinner {
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
      `}</style>
    </div>
  );
}
