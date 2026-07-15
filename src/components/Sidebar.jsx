import React from 'react';
import { BookOpen, History, Key, Moon, Sun, LogOut, User } from 'lucide-react';

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
        <img src="/favicon.png" alt="ScribeAI Logo" className="brand-logo-img" />
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
          border-right: 2px solid var(--text-primary);
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          height: 100vh;
          position: sticky;
          top: 0;
          box-sizing: border-box;
        }

        .sidebar-brand {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 0.5rem;
          margin-bottom: 2.5rem;
          width: 100%;
        }

        .brand-logo-img {
          width: 56px;
          height: 56px;
          object-fit: cover;
          object-position: center 25%; /* Focus on the graphic pen emblem, hiding the text */
          border-radius: 50%;
          border: 2.5px solid var(--text-primary);
          box-shadow: 3px 3px 0px var(--text-primary);
          background-color: #ffffff; /* White background to pop the blue elements */
          padding: 2px;
          box-sizing: border-box;
          flex-shrink: 0;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .brand-logo-img:hover {
          transform: scale(1.05) rotate(5deg);
          box-shadow: 4px 4px 0px var(--text-primary);
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
          gap: 0.75rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          background: var(--bg-tertiary);
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-ui);
          font-size: 0.9rem;
          font-weight: 700;
          text-align: left;
          transition: transform 0.1s, box-shadow 0.1s;
          width: 100%;
          box-shadow: 3px 3px 0px var(--text-primary);
          box-sizing: border-box;
        }

        .nav-item:hover {
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px var(--text-primary);
        }

        .nav-item:active {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0px var(--text-primary);
        }

        .nav-item.active {
          background-color: var(--accent-color);
          color: #ffffff;
          box-shadow: 3px 3px 0px var(--text-primary);
        }

        .nav-item.active:hover {
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px var(--text-primary);
          background-color: var(--accent-hover);
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 2px solid var(--text-primary);
        }

        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 0.8rem;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--text-primary);
          border-radius: var(--radius-sm);
          min-width: 0;
          box-shadow: 3px 3px 0px var(--text-primary);
          box-sizing: border-box;
        }

        .profile-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: var(--accent-glow);
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
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
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 600;
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
          transition: color 0.15s;
        }

        .signout-btn:hover {
          color: var(--error-color);
        }

        .theme-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-ui);
          font-size: 0.85rem;
          font-weight: 700;
          transition: transform 0.1s, box-shadow 0.1s;
          justify-content: center;
          box-shadow: 3px 3px 0px var(--text-primary);
          box-sizing: border-box;
        }

        .theme-toggle:hover {
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px var(--text-primary);
        }

        .theme-toggle:active {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0px var(--text-primary);
        }
      `}</style>
    </aside>
  );
}
