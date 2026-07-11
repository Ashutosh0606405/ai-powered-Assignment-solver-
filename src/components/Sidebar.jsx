import React from 'react';
import { BookOpen, History, Key, Moon, Sun, LogOut, User } from 'lucide-react';
import { signOut } from '../firebase';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  user, 
  authInstance 
}) {
  const menuItems = [
    { id: 'workspace', label: 'Workspace', icon: BookOpen },
    { id: 'history', label: 'History Logs', icon: History },
    { id: 'settings', label: 'API Keys', icon: Key },
  ];

  const handleSignOut = async () => {
    try {
      await authInstance.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <aside className="sidebar-container no-print">
      {/* Brand Logo */}
      <div className="sidebar-brand">
        <span className="brand-icon">✍️</span>
        <h2>ScribeAI</h2>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User profile & Log Out Footer */}
      <div className="sidebar-footer">
        
        {/* Active Profile Info */}
        {user && (
          <div className="user-profile-badge">
            <div className="profile-icon">
              <User size={14} />
            </div>
            <div className="profile-details">
              <p className="user-email" title={user.email}>{user.email}</p>
              <span className="user-role">Student</span>
            </div>
            <button className="signout-btn" onClick={handleSignOut} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        )}

        {/* Theme customizer */}
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle Light/Dark Theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <style>{`
        .sidebar-container {
          width: 260px;
          background-color: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          height: 100vh;
          position: sticky;
          top: 0;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
          padding-left: 0.5rem;
        }

        .brand-icon {
          font-size: 1.5rem;
        }

        .sidebar-brand h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.5px;
          margin: 0;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-ui);
          font-size: 0.95rem;
          font-weight: 500;
          text-align: left;
          transition: all var(--transition-fast);
          width: 100%;
        }

        .nav-item:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .nav-item.active {
          background-color: var(--accent-color);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 0.8rem;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          min-width: 0;
        }

        .profile-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: var(--accent-glow);
          color: var(--accent-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .profile-details {
          flex: 1;
          min-width: 0;
          text-align: left;
        }

        .user-email {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .signout-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .signout-btn:hover {
          color: var(--error-color);
          background-color: rgba(239, 68, 68, 0.08);
        }

        .theme-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-ui);
          font-size: 0.9rem;
          font-weight: 500;
          transition: all var(--transition-fast);
          justify-content: center;
        }

        .theme-toggle:hover {
          background-color: var(--border-color);
        }
      `}</style>
    </aside>
  );
}
