import React from 'react';
import { Type, Paintbrush, Sliders, Layout, Printer } from 'lucide-react';

export default function ControlPanel({ 
  settings, 
  setSettings, 
  onPrint, 
  hasContent 
}) {
  const paperOptions = [
    { id: 'lined', label: 'Lined' },
    { id: 'grid', label: 'Graph' },
    { id: 'blank', label: 'Plain' },
  ];

  const fontOptions = [
    { id: 'caveat', label: 'Classic Cursive', class: 'font-caveat' },
    { id: 'indie', label: 'Casual Script', class: 'font-indie' },
    { id: 'architect', label: 'Neat Print', class: 'font-architect' },
    { id: 'shadows', label: 'Fine Writing', class: 'font-shadows' },
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
          <h4 className="section-title"><Sliders size={14} /> Variations (Jitter)</h4>
          
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
              <span>Line Height</span>
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
              <span>Rotation Jitter</span>
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
              <span>Vertical Jitter</span>
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
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <style>{`
        .control-panel-container {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          height: fit-content;
          box-sizing: border-box;
        }

        .control-panel-container h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          text-align: left;
        }

        .control-panel-container .subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-align: left;
        }

        .control-sections {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .control-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .section-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          text-transform: uppercase;
          border-bottom: 2px solid var(--text-primary);
          padding-bottom: 0.25rem;
          text-align: left;
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
          padding: 0.45rem;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          font-family: inherit;
          text-align: center;
          box-shadow: 2px 2px 0px var(--text-primary);
          box-sizing: border-box;
        }

        .option-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px var(--text-primary);
        }

        .option-btn:active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0px var(--text-primary);
        }

        .option-btn.active {
          background-color: var(--accent-color);
          color: #ffffff;
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        .font-preview {
          text-align: left;
          padding: 0.5rem 0.75rem;
          font-size: 1.1rem;
        }

        .ink-options-row {
          display: flex;
          gap: 0.6rem;
          padding: 0.15rem 0;
        }

        .ink-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid var(--text-primary);
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        .ink-circle:hover {
          transform: scale(1.1) translate(-1px, -1px);
          box-shadow: 3px 3px 0px var(--text-primary);
        }

        .ink-circle.active {
          transform: scale(1.15);
          box-shadow: 0 0 0 2px var(--accent-color), 3px 3px 0px var(--text-primary);
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          margin-top: 0.15rem;
        }

        .slider-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 700;
        }

        .slider-group input[type="range"] {
          width: 100%;
          accent-color: var(--accent-color);
          cursor: pointer;
          height: 6px;
          background: var(--bg-tertiary);
          border: 2px solid var(--text-primary);
          border-radius: 4px;
          outline: none;
        }

        .actions-section {
          margin-top: 0.5rem;
        }

        .action-btn-primary {
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
          box-shadow: 3px 3px 0px var(--text-primary);
          box-sizing: border-box;
        }

        .action-btn-primary:hover:not(:disabled) {
          transform: translate(-1.5px, -1.5px);
          box-shadow: 4.5px 4.5px 0px var(--text-primary);
          background-color: var(--accent-hover);
        }

        .action-btn-primary:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0px var(--text-primary);
        }

        .action-btn-primary:disabled {
          background-color: var(--bg-tertiary);
          color: var(--text-muted);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }
      `}</style>
    </div>
  );
}
