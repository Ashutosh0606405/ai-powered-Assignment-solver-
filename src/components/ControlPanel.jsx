import React from 'react';
import { Type, Paintbrush, Sliders, Layout, Printer } from 'lucide-react';

export default function ControlPanel({ 
  settings, 
  setSettings, 
  onPrint, 
  hasContent 
}) {
  const paperOptions = [
    { id: 'lined', label: 'Lined Notebook' },
    { id: 'grid', label: 'Graph / Grid' },
    { id: 'blank', label: 'Plain Sheet' },
  ];

  const fontOptions = [
    { id: 'caveat', label: 'Classic Cursive', class: 'font-caveat' },
    { id: 'indie', label: 'Casual Script', class: 'font-indie' },
    { id: 'architect', label: 'Neat Print', class: 'font-architect' },
    { id: 'shadows', label: 'Fine Handwriting', class: 'font-shadows' },
    { id: 'reenie', label: 'Quick Cursive', class: 'font-reenie' },
  ];

  const inkOptions = [
    { id: 'blue', label: 'Royal Blue Ink', class: 'ink-blue', color: '#1b4f72' },
    { id: 'black', label: 'Gel Black Ink', class: 'ink-black', color: '#1f1f23' },
    { id: 'red', label: 'Grading Red Ink', class: 'ink-red', color: '#a93226' },
    { id: 'green', label: 'Teacher Green Ink', class: 'ink-green', color: '#196f3d' },
  ];

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="control-panel-container glass-panel no-print">
      <div className="panel-header">
        <h3>2. Document Customizer</h3>
        <p className="subtitle">Tune layout variables for authentic-looking handwriting.</p>
      </div>

      <div className="control-sections">
        {/* Paper Style Selection */}
        <div className="control-section">
          <h4 className="section-title"><Layout size={14} /> Paper Style</h4>
          <div className="grid-options">
            {paperOptions.map((opt) => (
              <button
                key={opt.id}
                className={`option-btn ${settings.paperStyle === opt.id ? 'active' : ''}`}
                onClick={() => updateSetting('paperStyle', opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Choice */}
        <div className="control-section">
          <h4 className="section-title"><Type size={14} /> Handwriting Font</h4>
          <div className="list-options">
            {fontOptions.map((opt) => (
              <button
                key={opt.id}
                className={`option-btn font-preview ${opt.class} ${settings.fontFamily === opt.id ? 'active' : ''}`}
                onClick={() => updateSetting('fontFamily', opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ink Colors */}
        <div className="control-section">
          <h4 className="section-title"><Paintbrush size={14} /> Pen / Ink Color</h4>
          <div className="ink-options-row">
            {inkOptions.map((opt) => (
              <button
                key={opt.id}
                className={`ink-circle ${settings.inkColor === opt.id ? 'active' : ''}`}
                style={{ backgroundColor: opt.color }}
                onClick={() => updateSetting('inkColor', opt.id)}
                title={opt.label}
              />
            ))}
          </div>
        </div>

        {/* Handwriting Sliders */}
        <div className="control-section">
          <h4 className="section-title"><Sliders size={14} /> Natural Variations (Jitter)</h4>
          
          <div className="slider-group">
            <div className="slider-label-row">
              <span>Font Size</span>
              <span>{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="30"
              step="1"
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span>Line Height (Spacing)</span>
              <span>{settings.lineHeight}</span>
            </div>
            <input
              type="range"
              min="1.3"
              max="2.2"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span>Word Gap</span>
              <span>{settings.wordSpacing}em</span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.5"
              step="0.01"
              value={settings.wordSpacing}
              onChange={(e) => updateSetting('wordSpacing', parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span>Letter Rotation Jitter</span>
              <span>{settings.rotationJitter}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="0.2"
              value={settings.rotationJitter}
              onChange={(e) => updateSetting('rotationJitter', parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span>Vertical Offset Jitter</span>
              <span>{settings.verticalJitter}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="0.5"
              value={settings.verticalJitter}
              onChange={(e) => updateSetting('verticalJitter', parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Action button */}
        <div className="actions-section">
          <button 
            className="action-btn-primary" 
            onClick={onPrint}
            disabled={!hasContent}
          >
            <Printer size={16} />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      <style>{`
        .control-panel-container {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          height: fit-content;
        }

        .control-panel-container h3 {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .control-panel-container .subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .control-sections {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .control-section {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .section-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.35rem;
        }

        .grid-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.4rem;
        }

        .list-options {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .option-btn {
          padding: 0.5rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-ui);
          text-align: center;
        }

        .option-btn:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          border-color: var(--accent-color);
        }

        .option-btn.active {
          background-color: var(--accent-glow);
          color: var(--accent-color);
          border-color: var(--accent-color);
        }

        .font-preview {
          text-align: left;
          padding: 0.6rem 0.8rem;
          font-size: 1.15rem;
        }

        .ink-options-row {
          display: flex;
          gap: 0.75rem;
          padding: 0.25rem 0;
        }

        .ink-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        .ink-circle:hover {
          transform: scale(1.1);
        }

        .ink-circle.active {
          border-color: var(--text-primary);
          transform: scale(1.15);
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-top: 0.25rem;
        }

        .slider-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .slider-group input[type="range"] {
          width: 100%;
          accent-color: var(--accent-color);
          cursor: pointer;
          height: 4px;
          background: var(--border-color);
          border-radius: 2px;
          outline: none;
        }

        .actions-section {
          margin-top: 0.75rem;
        }

        .action-btn-primary {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem;
          background-color: var(--accent-color);
          border: none;
          color: #ffffff;
          border-radius: var(--radius-sm);
          font-family: var(--font-ui);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .action-btn-primary:hover:not(:disabled) {
          background-color: var(--accent-hover);
          transform: translateY(-1px);
        }

        .action-btn-primary:disabled {
          background-color: var(--bg-tertiary);
          color: var(--text-muted);
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}
