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

// Hand-Drawn SVG Node Graph Diagram Component
function HandDrawnGraph({ spec, settings }) {
  const fontClass = `font-${settings.fontFamily}`;
  const inkClass = `ink-${settings.inkColor}`;
  
  // Parse edges: e.g. "A-B:4, B-C:10"
  const edges = useMemo(() => {
    try {
      return spec.split(',').map(item => {
        const parts = item.trim().split(':');
        const link = parts[0].trim().split('-');
        return {
          from: link[0].trim(),
          to: link[1].trim(),
          weight: parts[1] ? parts[1].trim() : ''
        };
      });
    } catch (e) {
      console.error("Error parsing graph spec:", e);
      return [];
    }
  }, [spec]);

  // Collect unique nodes
  const nodes = useMemo(() => {
    const unique = new Set();
    edges.forEach(e => {
      unique.add(e.from);
      unique.add(e.to);
    });
    return Array.from(unique).sort();
  }, [edges]);

  // Circle layout positions
  const positions = useMemo(() => {
    const coords = {};
    const center = { x: 250, y: 110 };
    const radiusX = 140;
    const radiusY = 70;
    nodes.forEach((node, idx) => {
      const theta = (idx * 2 * Math.PI) / nodes.length - Math.PI / 2;
      coords[node] = {
        x: Math.round(center.x + Math.cos(theta) * radiusX),
        y: Math.round(center.y + Math.sin(theta) * radiusY)
      };
    });
    return coords;
  }, [nodes]);

  if (edges.length === 0) return null;

  return (
    <div className={`hand-drawn-graph ${fontClass} ${inkClass}`}>
      <svg width="100%" height="220" viewBox="0 0 500 220" style={{ overflow: 'visible' }}>
        <defs>
          {/* Warp filter to displace straight vectors into hand-drawn sketches */}
          <filter id="sketch-wobble" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Draw Edges */}
        <g filter="url(#sketch-wobble)">
          {edges.map((edge, idx) => {
            const p1 = positions[edge.from];
            const p2 = positions[edge.to];
            if (!p1 || !p2) return null;

            return (
              <line
                key={`edge-${idx}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="currentColor"
                strokeWidth="2.5"
                opacity="0.8"
              />
            );
          })}
        </g>

        {/* Draw Edge Weights */}
        {edges.map((edge, idx) => {
          const p1 = positions[edge.from];
          const p2 = positions[edge.to];
          if (!p1 || !p2 || !edge.weight) return null;

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2 - 8;

          return (
            <g key={`weight-group-${idx}`} filter="url(#sketch-wobble)">
              <rect
                x={midX - 10}
                y={midY - 11}
                width="20"
                height="18"
                fill="#fffdf6"
                rx="3"
                opacity="0.9"
              />
              <text
                x={midX}
                y={midY + 2}
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="currentColor"
              >
                {edge.weight}
              </text>
            </g>
          );
        })}

        {/* Draw Nodes */}
        <g filter="url(#sketch-wobble)">
          {nodes.map((node) => {
            const pos = positions[node];
            if (!pos) return null;

            return (
              <g key={`node-${node}`} className="node-group">
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="18"
                  fill="#fffdf6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="bold"
                  fill="currentColor"
                >
                  {node}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default function DocumentViewer({ 
  solutionText, 
  settings, 
  onTextEdit,
  isLoading 
}) {
  const fontClass = `font-${settings.fontFamily}`;
  const inkClass = `ink-${settings.inkColor}`;

  const formattedLines = useMemo(() => {
    if (!solutionText) return [];

    const lines = solutionText.split('\n');
    return lines.map((line, lineIndex) => {
      // Check if it is a graph spec block
      const isGraph = line.trim().startsWith('[graph:') && line.trim().endsWith(']');
      let graphSpec = null;
      let processedWords = [];

      if (isGraph) {
        graphSpec = line.trim().substring(7, line.trim().length - 1);
      } else {
        const words = line.trim() === '' ? [] : line.split(/\s+/);
        processedWords = words.map((word, wordIndex) => {
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
      }

      return {
        isEmpty: line.trim() === '',
        isGraph,
        graphSpec,
        words: processedWords
      };
    });
  }, [solutionText, settings.rotationJitter, settings.verticalJitter, settings.wordSpacing]);

  // Determine dynamic spiral rings based on page length
  const spiralRingsCount = useMemo(() => {
    return Math.max(28, formattedLines.length + 8);
  }, [formattedLines]);

  const headerOffset = settings.paddingTop + 100;

  return (
    <div className="document-viewer-container">
      {isLoading ? (
        <div className="no-content-state glass-panel loader-card">
          <div className="ai-matrix-loader">
            <div className="digit">0</div>
            <div className="digit">1</div>
            <div className="digit">0</div>
            <div className="digit">1</div>
            <div className="digit">1</div>
            <div className="digit">0</div>
            <div className="digit">0</div>
            <div className="digit">1</div>
            <div className="glow"></div>
          </div>
          <h4>Solving Assignment Prompts...</h4>
          <p>AI engine is parsing uploads, analyzing queries, and writing handwritten documents.</p>
        </div>
      ) : solutionText ? (
        <div className="pages-scroll-wrapper">
          <div 
            className={`notebook-page paper-${settings.paperStyle} ${fontClass} ${inkClass}`}
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
              paddingTop: `${settings.paddingTop}px`,
              paddingLeft: `${settings.paddingLeft}px`,
              '--line-height-px': `${settings.fontSize * settings.lineHeight}px`,
              '--paper-padding-top': `${headerOffset}px`,
              '--paper-padding-left': `${settings.paddingLeft}px`,
              width: settings.pageFormat === 'letter' ? '215.9mm' : '210mm',
              minHeight: settings.pageFormat === 'letter' ? '279.4mm' : '297mm',
              height: 'auto'
            }}
          >
            {/* Hyper-realistic Spiral Binding Rings Overlay */}
            {settings.paperStyle === 'lined' && (
              <div className="spiral-binder">
                {Array.from({ length: spiralRingsCount }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className="spiral-ring"
                    style={{ height: 'var(--line-height-px, 32px)' }}
                  />
                ))}
              </div>
            )}

            {/* Top Notebook Header Block */}
            <div className="notebook-header-block">
              <div className="header-box-left">
                <div>Nome: <span className="handwritten-val">{settings.studentName || ''}</span></div>
                <div>Roll no: <span className="handwritten-val">{settings.rollNo || ''}</span></div>
              </div>
              <div className="header-box-right">
                <div>Date: <span className="handwritten-val">__/__/____</span></div>
                <div>Page: <span className="handwritten-val">01</span></div>
              </div>
            </div>

            {/* Assignment Title */}
            {settings.assignmentTitle && (
              <div className="notebook-assignment-title">
                {settings.assignmentTitle}
              </div>
            )}

            <div className="handwritten-content">
              {formattedLines.map((line, lineIdx) => {
                if (line.isGraph) {
                  return (
                    <div key={lineIdx} className="notebook-graph-container">
                      <HandDrawnGraph spec={line.graphSpec} settings={settings} />
                    </div>
                  );
                }

                if (line.isEmpty) {
                  return <div key={lineIdx} className="blank-line" style={{ height: 'var(--line-height-px, 32px)' }} />;
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
          background-color: transparent !important;
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

        .handwritten-line {
          min-height: 1.6em;
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
        }

        .blank-line {
          width: 100%;
        }

        /* Spiral Binder Layout */
        .spiral-binder {
          position: absolute;
          top: var(--paper-padding-top, 135px);
          left: 20px; /* Fixed safe margin on page edge */
          display: flex;
          flex-direction: column;
          z-index: 15;
          pointer-events: none;
        }

        .spiral-ring {
          width: 32px;
          position: relative;
        }

        /* Slanted metallic loop */
        .spiral-ring::after {
          content: '';
          position: absolute;
          top: -2px;
          left: 0;
          width: 32px;
          height: 12px;
          border: 2px solid #555555;
          border-radius: 50% / 100%;
          border-bottom: none;
          border-left: none;
          transform: rotate(-25deg);
          background: linear-gradient(135deg, #f0f0f0 0%, #a1a1a1 50%, #444444 100%);
          box-shadow: 1px 2px 2px rgba(0,0,0,0.2);
        }

        /* Hole punch shadow in paper */
        .spiral-ring::before {
          content: '';
          position: absolute;
          top: 2px;
          left: 28px;
          width: 8px;
          height: 8px;
          background-color: #1a1a1a;
          border-radius: 50%;
          opacity: 0.85;
        }

        .notebook-header-block {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 20px;
          border-bottom: 2px solid rgba(231, 76, 60, 0.45);
          padding-bottom: 12px;
          font-family: inherit;
          box-sizing: border-box;
          z-index: 10;
          position: relative;
        }

        .header-box-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
          border: 1.5px solid currentColor;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.75em;
          min-width: 200px;
          text-align: left;
          font-weight: 700;
          box-sizing: border-box;
        }

        .header-box-right {
          display: flex;
          flex-direction: column;
          gap: 2px;
          border: 1.5px solid currentColor;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.75em;
          min-width: 130px;
          text-align: left;
          font-weight: 700;
          box-sizing: border-box;
        }

        .handwritten-val {
          font-weight: normal;
          padding-left: 6px;
        }

        .notebook-assignment-title {
          text-align: center;
          font-size: 1.15em;
          font-weight: bold;
          margin-top: 10px;
          margin-bottom: 30px;
          text-decoration: underline;
          width: 100%;
          position: relative;
          z-index: 5;
        }

        /* Hand-drawn graph styles */
        .notebook-graph-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin: 25px 0;
          z-index: 10;
          position: relative;
        }

        .hand-drawn-graph {
          width: 100%;
          max-width: 500px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .inline-editor-card {
          width: 210mm;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          box-sizing: border-box;
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
          font-weight: 700;
        }

        .inline-textarea {
          width: 100%;
          height: 150px;
          padding: 0.75rem;
          background-color: var(--bg-primary);
          border: 2px solid var(--text-primary);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-code);
          font-size: 0.85rem;
          line-height: 1.4;
          resize: vertical;
          outline: none;
          box-sizing: border-box;
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
          box-sizing: border-box;
        }

        .loader-card {
          border-color: #00ff88 !important;
          box-shadow: 5px 5px 0px #00ff88 !important;
        }

        .loader-card h4 {
          color: #00ff88;
          text-shadow: 0 0 5px rgba(0, 255, 136, 0.3);
          font-weight: 700;
          font-size: 1.15rem;
        }

        .no-content-icon {
          color: var(--text-muted);
          animation: float 4s ease-in-out infinite;
        }

        .no-content-state h4 {
          font-size: 1.15rem;
          font-weight: 700;
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

        /* Scoped Uiverse Loader CSS by PriyanshuGupta28 */
        .ai-matrix-loader {
          width: 120px;
          height: 160px;
          margin: 10px auto 20px auto;
          position: relative;
          perspective: 800px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5px;
        }

        .digit {
          color: #00ff88;
          font-family: monospace;
          font-size: 20px;
          font-weight: bold;
          text-align: center;
          text-shadow: 0 0 8px #00ff88;
          animation:
            matrix-fall 2s infinite,
            matrix-flicker 0.5s infinite;
          opacity: 0;
        }

        .digit:nth-child(1) { animation-delay: 0.1s; }
        .digit:nth-child(2) { animation-delay: 0.3s; }
        .digit:nth-child(3) { animation-delay: 0.5s; }
        .digit:nth-child(4) { animation-delay: 0.7s; }
        .digit:nth-child(5) { animation-delay: 0.9s; }
        .digit:nth-child(6) { animation-delay: 1.1s; }
        .digit:nth-child(7) { animation-delay: 1.3s; }
        .digit:nth-child(8) { animation-delay: 1.5s; }

        .glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle,
            rgba(0, 255, 136, 0.15) 0%,
            transparent 70%
          );
          animation: matrix-pulse 2s infinite;
          pointer-events: none;
        }

        @keyframes matrix-fall {
          0% {
            transform: translateY(-40px) rotateX(90deg);
            opacity: 0;
          }
          20%,
          80% {
            transform: translateY(0) rotateX(0deg);
            opacity: 0.9;
          }
          100% {
            transform: translateY(40px) rotateX(-90deg);
            opacity: 0;
          }
        }

        @keyframes matrix-flicker {
          0%, 19%, 21%, 100% { opacity: 0.9; }
          20% { opacity: 0.3; }
        }

        @keyframes matrix-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
