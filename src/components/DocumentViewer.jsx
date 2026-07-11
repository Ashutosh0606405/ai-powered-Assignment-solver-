import React, { useMemo } from 'react';
import { FileText, Edit } from 'lucide-react';

const getHash = (str, index) => {
  let hash = 0;
  const combined = str + index;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export default function DocumentViewer({ 
  solutionText, 
  settings, 
  onTextEdit 
}) {
  const fontClass = `font-${settings.fontFamily}`;
  const inkClass = `ink-${settings.inkColor}`;

  const formattedPages = useMemo(() => {
    if (!solutionText) return [];

    const lines = solutionText.split('\n');
    const linesPerPage = 22;
    const pages = [];
    let currentLines = [];

    lines.forEach((line, lineIndex) => {
      const words = line.trim() === '' ? [] : line.split(/\s+/);
      
      const processedWords = words.map((word, wordIndex) => {
        const hashRot = getHash(word, lineIndex + wordIndex);
        const hashY = getHash(word, lineIndex + wordIndex + 100);
        const hashGap = getHash(word, lineIndex + wordIndex + 200);

        const rot = settings.rotationJitter > 0
          ? ((hashRot % 100) / 100) * (settings.rotationJitter * 2) - settings.rotationJitter
          : 0;

        const yOffset = settings.verticalJitter > 0
          ? ((hashY % 100) / 100) * (settings.verticalJitter * 2) - settings.verticalJitter
          : 0;

        const wordGap = settings.wordSpacing + ((hashGap % 50) / 500);

        return {
          text: word,
          rot: rot.toFixed(2),
          yOffset: yOffset.toFixed(2),
          gap: wordGap.toFixed(3)
        };
      });

      currentLines.push({
        isEmpty: line.trim() === '',
        words: processedWords
      });

      if (currentLines.length >= linesPerPage) {
        pages.push(currentLines);
        currentLines = [];
      }
    });

    if (currentLines.length > 0 || pages.length === 0) {
      pages.push(currentLines);
    }

    return pages;
  }, [solutionText, settings.rotationJitter, settings.verticalJitter, settings.wordSpacing]);

  return (
    <div className="document-viewer-container">
      {solutionText ? (
        <div className="pages-scroll-wrapper">
          {formattedPages.map((pageLines, pageIdx) => (
            <div 
              key={pageIdx} 
              className={`notebook-page paper-${settings.paperStyle} ${fontClass} ${inkClass}`}
              style={{
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
                paddingLeft: settings.paperStyle === 'lined' ? '90px' : '60px'
              }}
            >
              <div className="page-number no-print">Page {pageIdx + 1}</div>

              <div className="handwritten-content">
                {pageLines.map((line, lineIdx) => {
                  if (line.isEmpty) {
                    return <div key={lineIdx} className="blank-line" style={{ height: `${settings.fontSize * settings.lineHeight}px` }} />;
                  }

                  return (
                    <div key={lineIdx} className="handwritten-line">
                      {line.words.map((word, wordIdx) => (
                        <span 
                          key={wordIdx} 
                          className="word-span"
                          style={{
                            '--rot': `${word.rot}deg`,
                            '--y-offset': `${word.yOffset}px`,
                            '--word-gap': `${word.gap}em`
                          }}
                        >
                          {word.text}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick inline text editor overlay */}
          <div className="inline-editor-card glass-panel no-print">
            <div className="card-header">
              <Edit size={16} className="card-icon" />
              <h4>Fine-tune Answer Text</h4>
            </div>
            <textarea
              className="inline-textarea"
              value={solutionText}
              onChange={(e) => onTextEdit(e.target.value)}
              placeholder="Edit the solved text here and the notebook will update instantly..."
            />
          </div>
        </div>
      ) : (
        <div className="no-content-state glass-panel">
          <FileText size={48} className="no-content-icon" />
          <h4>Your Solved Assignment Appears Here</h4>
          <p>Configure your prompt, upload a file, and click "Solve" to generate your custom hand-written document.</p>
        </div>
      )}

      <style>{`
        .document-viewer-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          background-color: var(--bg-primary);
          overflow-y: auto;
          transition: background-color var(--transition-normal);
        }

        .pages-scroll-wrapper {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          align-items: center;
          width: 100%;
        }

        .page-number {
          position: absolute;
          top: 30px;
          right: 40px;
          font-family: var(--font-ui);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          background-color: var(--bg-tertiary);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-sm);
        }

        .handwritten-line {
          min-height: 1.6em;
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
        }

        .blank-line {
          width: 100%;
        }

        .inline-editor-card {
          width: 210mm;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
        }

        .card-icon {
          color: var(--accent-color);
        }

        .card-header h4 {
          font-size: 0.95rem;
          font-weight: 600;
        }

        .inline-textarea {
          width: 100%;
          height: 150px;
          padding: 0.75rem;
          background-color: rgba(0, 0, 0, 0.15);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-code);
          font-size: 0.85rem;
          line-height: 1.4;
          resize: vertical;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .inline-textarea:focus {
          border-color: var(--accent-color);
        }

        .no-content-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 2rem;
          max-width: 500px;
          margin-top: 5rem;
          gap: 1rem;
        }

        .no-content-icon {
          color: var(--text-muted);
          animation: float 4s ease-in-out infinite;
        }

        .no-content-state h4 {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .no-content-state p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
