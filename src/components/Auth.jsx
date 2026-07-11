import React, { useState } from 'react';
import { Mail, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export default function Auth({ authInstance }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        await authInstance.createUserWithEmailAndPassword(email, password);
      } else {
        await authInstance.signInWithEmailAndPassword(email, password);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Glowing background blobs */}
      <div className="glow-blob glow-blob-1"></div>
      <div className="glow-blob glow-blob-2"></div>

      <div className="auth-card glass-panel">
        {/* Logo Branding */}
        <div className="auth-header">
          <div className="auth-logo">✍️</div>
          <h2 className="auth-title">ScribeAI Workspace</h2>
          <p className="auth-subtitle">
            {isSignUp ? 'Create a secure student account' : 'Sign in to access your saved worksheets'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email field */}
          <div className="auth-group">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon" size={16} />
              <input
                type="email"
                required
                placeholder="student@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="auth-group">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" size={16} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>

          {/* Confirm Password (only on Sign Up) */}
          {isSignUp && (
            <div className="auth-group">
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>
          )}

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={isLoading}
            className="auth-btn"
          >
            {isLoading ? (
              <span className="auth-spinner"></span>
            ) : isSignUp ? (
              <>
                <UserPlus size={16} />
                <span>Register Account</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle between login/register */}
        <div className="auth-footer">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); }}
                className="auth-link"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); }}
                className="auth-link"
              >
                Register
              </button>
            </p>
          )}
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-primary);
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: background-color var(--transition-normal);
        }

        .glow-blob {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.15;
          pointer-events: none;
        }

        .glow-blob-1 {
          top: 15%;
          left: 15%;
          background-color: var(--accent-color);
          animation: floatBlob1 8s infinite ease-in-out;
        }

        .glow-blob-2 {
          bottom: 15%;
          right: 15%;
          background-color: #8b5cf6;
          animation: floatBlob2 8s infinite ease-in-out 1s;
        }

        @keyframes floatBlob1 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        @keyframes floatBlob2 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(20px) scale(1.05); }
        }

        .auth-card {
          max-width: 420px;
          width: 100%;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          position: relative;
          z-index: 10;
        }

        .auth-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
        }

        .auth-logo {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background-color: var(--accent-glow);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }

        .auth-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.5px;
        }

        .auth-subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem;
          background-color: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--error-color);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          text-align: left;
        }

        .error-icon {
          flex-shrink: 0;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .auth-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          text-align: left;
        }

        .auth-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .auth-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-input-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--text-muted);
        }

        .auth-input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.25rem;
          background-color: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-ui);
          font-size: 0.85rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .auth-input:focus {
          border-color: var(--accent-color);
        }

        .auth-btn {
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
          font-size: 0.9rem;
          font-weight: 600;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
          margin-top: 0.5rem;
        }

        .auth-btn:hover:not(:disabled) {
          background-color: var(--accent-hover);
          transform: translateY(-1px);
        }

        .auth-btn:disabled {
          background-color: var(--bg-tertiary);
          color: var(--text-muted);
          cursor: not-allowed;
          box-shadow: none;
        }

        .auth-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s infinite linear;
        }

        .auth-footer {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .auth-link {
          background: transparent;
          border: none;
          color: var(--accent-color);
          font-weight: 600;
          cursor: pointer;
          outline: none;
        }

        .auth-link:hover {
          text-decoration: underline;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
