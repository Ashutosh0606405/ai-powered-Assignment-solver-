import React, { useState } from 'react';
import { Key, Eye, EyeOff, Save, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SettingsModal({ apiKey, setApiKey, model, setModel }) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setApiKey(inputKey);
    localStorage.setItem('scribe_gemini_api_key', inputKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="settings-panel glass-panel">
      <div className="panel-header">
        <Key className="panel-icon" size={24} />
        <h2>API & Configuration</h2>
      </div>
      
      <p className="panel-description">
        ScribeAI uses Google's Gemini models to solve assignments. Enter your API key below. 
        Your key is stored securely only in your browser's local storage.
      </p>

      <div className="config-form">
        <div className="form-group">
          <label htmlFor="api-key-input">Gemini API Key</label>
          <div className="input-wrapper">
            <input
              id="api-key-input"
              type={showKey ? 'text' : 'password'}
              placeholder="AIzaSy..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowKey(!showKey)}
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="help-text">
            Don't have an API key? You can get a free key from the{' '}
            <a 
              href="https://aistudio.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="link-accent"
            >
              Google AI Studio
            </a>.
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="model-select">AI Model Engine</label>
          <select
            id="model-select"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="model-select-dropdown"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Ultra Fast)</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro (Best for Complex Math/Logic)</option>
          </select>
        </div>

        {!apiKey && (
          <div className="alert alert-warning">
            <AlertTriangle className="alert-icon" size={16} />
            <div>
              <strong>Demo Mode:</strong> No API key saved. ScribeAI will use the built-in simulated solvers 
              for testing out features (such as math problem and history essay simulation).
            </div>
          </div>
        )}

        {apiKey && (
          <div className="alert alert-success">
            <CheckCircle className="alert-icon" size={16} />
            <div>
              <strong>Active Session:</strong> Your Gemini API key is configured. You can now solve 
              real-time scanned assignments.
            </div>
          </div>
        )}

        <button 
          className={`save-btn ${isSaved ? 'success' : ''}`} 
          onClick={handleSave}
          disabled={inputKey === apiKey && apiKey !== ''}
        >
          <Save size={16} />
          <span>{isSaved ? 'Key Saved Successfully!' : 'Save Key'}</span>
        </button>
      </div>

      <style>{`
        .settings-panel {
          padding: 2rem;
          max-width: 600px;
          margin: 3rem auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
        }

        .panel-icon {
          color: var(--accent-color);
        }

        .panel-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .panel-description {
          color: var(--text-secondary);
          line-height: 1.5;
          font-size: 0.95rem;
        }

        .config-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper input {
          width: 100%;
          padding: 0.8rem 2.5rem 0.8rem 1rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-code);
          font-size: 0.9rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .input-wrapper input:focus {
          border-color: var(--accent-color);
        }

        .toggle-visibility {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-visibility:hover {
          color: var(--text-primary);
        }

        .help-text {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .link-accent {
          color: var(--accent-color);
          text-decoration: none;
          font-weight: 500;
        }

        .link-accent:hover {
          text-decoration: underline;
        }

        .model-select-dropdown {
          padding: 0.8rem 1rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-ui);
          font-size: 0.9rem;
          outline: none;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }

        .model-select-dropdown:focus {
          border-color: var(--accent-color);
        }

        .alert {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .alert-warning {
          background-color: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: #f59e0b;
        }

        .alert-success {
          background-color: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #10b981;
        }

        .alert-icon {
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .save-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem;
          background-color: var(--accent-color);
          border: none;
          color: #ffffff;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-ui);
          font-size: 0.95rem;
          font-weight: 600;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .save-btn:hover:not(:disabled) {
          background-color: var(--accent-hover);
        }

        .save-btn:disabled {
          background-color: var(--bg-tertiary);
          color: var(--text-muted);
          cursor: not-allowed;
          box-shadow: none;
        }

        .save-btn.success {
          background-color: var(--success-color);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
      `}</style>
    </div>
  );
}
