import React from 'react';
import { BookOpen, Images, Scissors, LogOut, User } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  user, 
  authInstance,
  isMock
}) {
  const menuItems = [
    { id: 'workspace', label: 'Workspace', icon: BookOpen },
    { id: 'pdf-generator', label: 'PDF Generator', icon: Images },
    { id: 'pdf-editor', label: 'PDF Editor', icon: Scissors },
  ];

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
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=256"
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
          <div className="navbar-profile-badge">
            <div className="profile-icon">
              <User size={12} />
            </div>
            <div className="profile-details">
              <span className="user-email-text" title={user.email}>{user.email}</span>
            </div>
            <button className="signout-icon-btn" onClick={handleSignOut} title="Sign Out">
              <LogOut size={14} />
            </button>
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

        .navbar-profile-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3rem 0.6rem;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--text-primary);
          border-radius: var(--radius-sm);
          box-shadow: 2px 2px 0px var(--text-primary);
          max-width: 180px;
        }

        .profile-icon {
          background-color: var(--accent-color);
          color: #ffffff;
          padding: 0.2rem;
          border-radius: 3px;
          border: 1px solid var(--text-primary);
          display: flex;
        }

        .user-email-text {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 90px;
        }

        .signout-icon-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          padding: 2px;
        }

        .signout-icon-btn:hover {
          color: var(--error-color);
        }
      `}</style>
    </nav>
  );
}
