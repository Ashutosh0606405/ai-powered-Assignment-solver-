import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Images, Scissors, LogOut, User, Settings } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  user, 
  authInstance,
  isMock
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const menuItems = [
    { id: 'workspace', label: 'Workspace', icon: BookOpen },
    { id: 'pdf-generator', label: 'PDF Generator', icon: Images },
    { id: 'pdf-editor', label: 'PDF Editor', icon: Scissors },
  ];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSignOut = async () => {
    try {
      await authInstance.signOut();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="top-navbar no-print">
      <div className="navbar-left">
        <div className="navbar-brand">
          <img 
            className="brand-logo-small" 
            src="/favicon.png"
            alt="ScribeAI Logo" 
          />
          <h2>ScribeAI</h2>
        </div>
      </div>

      <div className="navbar-center">
        <div className="nav-pills-group">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-pill-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="navbar-right">
        {isMock ? (
          <div className="api-status-badge warning">
            <span className="dot"></span>
            <span>Demo Mode</span>
          </div>
        ) : (
          <div className="api-status-badge success">
            <span className="dot"></span>
            <span>Gemini Live</span>
          </div>
        )}

        {user && (
          <div className="navbar-settings-wrapper" ref={dropdownRef}>
            <button 
              className={`navbar-settings-btn ${showDropdown ? 'active' : ''}`}
              onClick={() => setShowDropdown(!showDropdown)}
              title="Account & Settings"
            >
              <Settings size={15} />
              <span>Settings</span>
            </button>

            {showDropdown && (
              <div className="navbar-dropdown-menu glass-panel no-print">
                <div className="dropdown-user-info">
                  <span className="info-label">Student Account</span>
                  <span className="info-email" title={user.email}>{user.email}</span>
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-action-btn logout-btn" onClick={handleSignOut}>
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .top-navbar {
          height: 65px;
          background-color: var(--bg-secondary) !important;
          border-bottom: 2px solid var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          box-sizing: border-box;
        }

        .navbar-left {
          display: flex;
          align-items: center;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .brand-logo-small {
          width: 32px;
          height: 32px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid var(--text-primary);
          box-shadow: 2px 2px 0px var(--text-primary);
          background-color: #ffffff;
          padding: 1px;
        }

        .navbar-brand h2 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.5px;
          margin: 0;
        }

        .navbar-center {
          display: flex;
          align-items: center;
        }

        .nav-pills-group {
          display: flex;
          gap: 0.5rem;
          background-color: var(--bg-tertiary);
          padding: 0.25rem;
          border: 2px solid var(--text-primary);
          border-radius: var(--radius-sm);
          box-shadow: 2.5px 2.5px 0px var(--text-primary);
        }

        .nav-pill-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 0.85rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          border-radius: 4px;
          font-family: var(--font-ui);
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          transition: background-color var(--transition-fast), color var(--transition-fast);
        }

        .nav-pill-btn:hover {
          color: var(--text-primary);
          background-color: rgba(255, 255, 255, 0.05);
        }

        .nav-pill-btn.active {
          background-color: var(--accent-color);
          color: #ffffff;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .api-status-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.65rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 750;
          border: 1.5px solid var(--text-primary);
          box-shadow: 1.5px 1.5px 0px var(--text-primary);
        }

        .api-status-badge.warning {
          background-color: rgba(245, 158, 11, 0.08);
          color: #f59e0b;
        }

        .api-status-badge.success {
          background-color: rgba(16, 185, 129, 0.08);
          color: #10b981;
        }

        .api-status-badge .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: currentColor;
        }

        /* Settings dropdown wrapper */
        .navbar-settings-wrapper {
          position: relative;
        }

        .navbar-settings-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.85rem;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          box-shadow: 2.5px 2.5px 0px var(--text-primary);
        }

        .navbar-settings-btn:hover, .navbar-settings-btn.active {
          transform: translate(-1px, -1px);
          box-shadow: 3.5px 3.5px 0px var(--text-primary);
          background-color: var(--bg-secondary);
        }

        .navbar-settings-btn:active {
          transform: translate(1.5px, 1.5px);
          box-shadow: none;
        }

        /* Brutalist Dropdown menu styles */
        .navbar-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 220px;
          background-color: var(--bg-secondary) !important;
          border: 2px solid var(--text-primary) !important;
          border-radius: var(--radius-sm);
          box-shadow: 4px 4px 0px var(--text-primary);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 200;
          box-sizing: border-box;
          text-align: left;
        }

        .dropdown-user-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          padding: 0.25rem 0.4rem;
        }

        .info-label {
          font-size: 0.65rem;
          font-weight: 850;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-email {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-divider {
          height: 2px;
          background-color: var(--text-primary);
          margin: 0.25rem 0;
        }

        .dropdown-action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.6rem;
          width: 100%;
          background: none;
          border: 2px solid transparent;
          border-radius: 4px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          text-align: left;
          box-sizing: border-box;
          transition: background-color var(--transition-fast), border-color var(--transition-fast);
        }

        .dropdown-action-btn:hover {
          background-color: var(--bg-tertiary);
          border-color: var(--text-primary);
        }

        .dropdown-action-btn.logout-btn {
          color: var(--error-color);
        }

        .dropdown-action-btn.logout-btn:hover {
          background-color: rgba(248, 113, 113, 0.1);
        }
      `}</style>
    </nav>
  );
}
