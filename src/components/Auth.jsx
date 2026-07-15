import React, { useState } from 'react';
import { 
  auth, 
  isMock, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from '../firebase';
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { AlertCircle } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper wrappers to handle both Real Firebase SDK and Local Mock environments
  const executeSignIn = async (emailVal, passwordVal) => {
    if (isMock) {
      return await auth.signInWithEmailAndPassword(emailVal, passwordVal);
    } else {
      return await signInWithEmailAndPassword(auth, emailVal, passwordVal);
    }
  };

  const executeSignUp = async (emailVal, passwordVal) => {
    if (isMock) {
      return await auth.createUserWithEmailAndPassword(emailVal, passwordVal);
    } else {
      return await createUserWithEmailAndPassword(auth, emailVal, passwordVal);
    }
  };

  // Passwordless automatic entry flow matching the exact Uiverse HTML inputs
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      // Attempt login, if not found then register automatically
      try {
        await executeSignIn(email, "default_password_123");
      } catch (err) {
        // If sign in fails, attempt registration
        await executeSignUp(email, "default_password_123");
      }
    } catch (err) {
      console.error("Auth submit error:", err);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth Handlers
  const handleGoogleOAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isMock) {
        await executeSignIn("google_user@gmail.com", "default_password_123");
      } else {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Google Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubOAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isMock) {
        await executeSignIn("github_user@github.com", "default_password_123");
      } else {
        const provider = new GithubAuthProvider();
        await signInWithPopup(auth, provider);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "GitHub Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* 1. Document Checklist Doodle */}
      <svg viewBox="0 0 24 24" className="bg-doodle bg-doodle-1" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
        <path d="M9 11l2 2 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 17h10M7 7h10" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {/* 2. Math Formula Doodle (a² + b² = c²) */}
      <svg viewBox="0 0 120 40" className="bg-doodle bg-doodle-2">
        <text x="5" y="25" fontFamily="'Space Mono', monospace" fontSize="16" fontWeight="bold" fill="currentColor">a² + b² = c²</text>
        <path d="M5 32h110" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
      </svg>

      {/* 3. Drawing Triangle Ruler Doodle */}
      <svg viewBox="0 0 24 24" className="bg-doodle bg-doodle-3" fill="none" stroke="currentColor">
        <path d="M5 3v18h18L5 3z" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 7h2M7 10h4M7 13h2M7 16h6M7 19h2" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {/* 4. Pencil Sketching Doodle */}
      <svg viewBox="0 0 24 24" className="bg-doodle bg-doodle-4" fill="none" stroke="currentColor">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M15 5l4 4M9 11l4 4" strokeWidth="1.5" />
      </svg>

      {/* 5. Graduation Cap / Academic Degree Doodle */}
      <svg viewBox="0 0 24 24" className="bg-doodle bg-doodle-5" fill="none" stroke="currentColor">
        <path d="M22 10L12 5 2 10l10 5 10-5z" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M6 12v5c0 2 2.5 3 6 3s6-1 6-3v-5" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M20 10v6l-2 1" strokeWidth="1.5" />
      </svg>

      {/* 6. Calculus Integral Doodle */}
      <svg viewBox="0 0 40 80" className="bg-doodle bg-doodle-6">
        <path d="M25 10c-5 0-7 3-7 8v44c0 5 2 8 7 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        <text x="5" y="45" fontFamily="'Space Mono', monospace" fontSize="10" fill="currentColor">f(x)dx</text>
      </svg>

      {/* 7. Analytics Progress Graph Doodle */}
      <svg viewBox="0 0 24 24" className="bg-doodle bg-doodle-7" fill="none" stroke="currentColor">
        <path d="M3 3v18h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 5L12 11L8 8L3 15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="5" r="1.5" fill="currentColor" />
        <circle cx="12" cy="11" r="1.5" fill="currentColor" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      </svg>

      <div className="uiverse-wrapper">
        {error && (
          <div className="auth-error-uiverse">
            <AlertCircle size={16} className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="form">
          <p>
            Welcome,<span>sign in to continue</span>
          </p>
          
          {/* Google Button */}
          <button type="button" className="oauthButton" onClick={handleGoogleOAuth} disabled={isLoading}>
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              <path d="M1 1h22v22H1z" fill="none"></path>
            </svg>
            Continue with Google
          </button>

          {/* GitHub Button */}
          <button type="button" className="oauthButton" onClick={handleGithubOAuth} disabled={isLoading}>
            <svg className="icon" viewBox="0 0 24 24" fill="#111">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
            </svg>
            Continue with Github
          </button>

          <div className="separator">
            <div></div>
            <span>OR</span>
            <div></div>
          </div>

          {/* Email Input */}
          <input 
            type="email" 
            placeholder="Email" 
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />

          <button type="submit" className="oauthButton" disabled={isLoading}>
            {isLoading ? (
              <span className="auth-spinner"></span>
            ) : (
              <>
                Continue
                <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m6 17 5-5-5-5"></path>
                  <path d="m13 17 5-5-5-5"></path>
                </svg>
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        /* Container page with grid graph paper styling */
        .auth-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #1e1e24;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
          background-size: 32px 32px;
          padding: 1.5rem;
          position: relative;
          font-family: 'Space Mono', 'Plus Jakarta Sans', monospace;
          overflow: hidden;
        }

        /* Floating background assignment/doodle items */
        .bg-doodle {
          position: absolute;
          color: rgba(255, 255, 255, 0.06);
          pointer-events: none;
          z-index: 1;
          animation: floatDoodle 6s infinite ease-in-out;
        }

        .bg-doodle-1 { top: 8%; left: 8%; width: 70px; height: 70px; transform: rotate(-12deg); animation-delay: 0.2s; }
        .bg-doodle-2 { top: 12%; right: 8%; width: 140px; height: 50px; transform: rotate(15deg); animation-delay: 1.5s; }
        .bg-doodle-3 { bottom: 8%; left: 10%; width: 80px; height: 80px; transform: rotate(20deg); animation-delay: 0.8s; }
        .bg-doodle-4 { bottom: 15%; right: 7%; width: 70px; height: 70px; transform: rotate(-35deg); animation-delay: 2.2s; }
        .bg-doodle-5 { top: 45%; left: 5%; width: 85px; height: 85px; transform: rotate(8deg); animation-delay: 1.1s; }
        .bg-doodle-6 { bottom: 42%; right: 4%; width: 50px; height: 100px; transform: rotate(-10deg); animation-delay: 2.8s; }
        .bg-doodle-7 { bottom: 8%; left: 45%; width: 75px; height: 75px; transform: rotate(-5deg); animation-delay: 1.9s; }

        @keyframes floatDoodle {
          0%, 100% { transform: translateY(0) rotate(var(--rot-base, 0deg)); }
          50% { transform: translateY(-8px) rotate(var(--rot-base, 0deg)); }
        }

        /* Scoped adjustments to inject rotation parameters for keys */
        .bg-doodle-1 { --rot-base: -12deg; }
        .bg-doodle-2 { --rot-base: 15deg; }
        .bg-doodle-3 { --rot-base: 20deg; }
        .bg-doodle-4 { --rot-base: -35deg; }
        .bg-doodle-5 { --rot-base: 8deg; }
        .bg-doodle-6 { --rot-base: -10deg; }
        .bg-doodle-7 { --rot-base: -5deg; }

        .uiverse-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          z-index: 10;
        }

        .auth-error-uiverse {
          width: 250px;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 0.85rem;
          background-color: #fce8e6;
          border: 2px solid #a93226;
          color: #a93226;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
          text-align: left;
          box-shadow: 4px 4px #a93226;
          box-sizing: border-box;
        }

        .error-icon {
          flex-shrink: 0;
        }

        /* Scoped Brutalist Uiverse CSS */
        .form {
          --background: #d3d3d3;
          --input-focus: #2d8cf0;
          --font-color: #323232;
          --font-color-sub: #666;
          --bg-color: #fff;
          --main-color: #323232;
          padding: 20px;
          background: var(--background);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 20px;
          border-radius: 5px;
          border: 2px solid var(--main-color);
          box-shadow: 4px 4px var(--main-color);
          box-sizing: border-box;
        }

        .form > p {
          color: var(--font-color);
          font-weight: 700;
          font-size: 20px;
          margin-bottom: 5px;
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .form > p > span {
          color: var(--font-color-sub);
          font-weight: 600;
          font-size: 13px;
          margin-top: 4px;
        }

        .separator {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .separator > div {
          flex: 1;
          height: 2px;
          border-radius: 5px;
          background-color: var(--font-color-sub);
        }

        .separator > span {
          color: var(--font-color);
          font-weight: 700;
          font-size: 12px;
        }

        .oauthButton {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          padding: 0 15px;
          width: 250px;
          height: 44px;
          border-radius: 5px;
          border: 2px solid var(--main-color);
          background-color: var(--bg-color);
          box-shadow: 4px 4px var(--main-color);
          font-size: 14px;
          font-weight: 700;
          color: var(--font-color);
          cursor: pointer;
          transition: all 250ms;
          position: relative;
          overflow: hidden;
          z-index: 1;
          box-sizing: border-box;
          font-family: inherit;
        }

        .oauthButton::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 0;
          background-color: #212121;
          z-index: -1;
          box-shadow: 4px 8px 19px -3px rgba(0, 0, 0, 0.27);
          transition: all 250ms;
        }

        .oauthButton:hover:not(:disabled) {
          color: #e8e8e8;
        }

        .oauthButton:hover:not(:disabled)::before {
          width: 100%;
        }

        .oauthButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form > input {
          width: 250px;
          height: 44px;
          border-radius: 5px;
          border: 2px solid var(--main-color);
          background-color: var(--bg-color);
          box-shadow: 4px 4px var(--main-color);
          font-size: 14px;
          font-weight: 600;
          color: var(--font-color);
          padding: 5px 12px;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .form > input:focus {
          border-color: var(--input-focus);
        }

        .icon {
          width: 1.25rem;
          height: 1.25rem;
          flex-shrink: 0;
        }

        .auth-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #212121;
          border-radius: 50%;
          animation: spin 0.8s infinite linear;
        }

        .oauthButton:hover .auth-spinner {
          border-color: rgba(255, 255, 255, 0.2);
          border-top-color: #ffffff;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
