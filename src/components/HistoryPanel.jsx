import React, { useState, useEffect } from 'react';
import { db, isMock } from '../firebase';
import { History, FileText, ChevronRight, Clock, RefreshCw } from 'lucide-react';

export default function HistoryPanel({ user, onLoadDocument }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data = [];
      if (isMock) {
        // Fetch from mock local storage collector
        data = await db.getDocuments('assignments', user.uid);
      } else {
        // Fetch from real Firestore queries
        const q = query(
          collection(db, 'assignments'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
          data.push({ id: doc.id, ...doc.data() });
        });
      }
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="history-panel-container max-w-4xl mx-auto p-6">
      
      <div className="history-header">
        <div className="header-left">
          <History className="header-icon" size={24} />
          <h2>My Solved Assignments</h2>
        </div>
        <button className="refresh-btn" onClick={fetchHistory} title="Refresh log">
          <RefreshCw size={16} />
        </button>
      </div>

      <p className="description">
        Your assignments are stored securely in your database history. Click on any past solved paper 
        to reload it directly into the customizer workspace.
      </p>

      {loading ? (
        <div className="loading-state">
          <span className="spinner"></span>
          <span>Loading historical worksheets...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="empty-state glass-panel">
          <FileText size={48} className="empty-icon" />
          <h4>No Saved Assignments Found</h4>
          <p>Go to the "Workspace" tab, solve a homework sheet, and it will be saved here automatically.</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div 
              key={item.id} 
              className="history-card glass-panel"
              onClick={() => onLoadDocument(item)}
            >
              <div className="card-top">
                <div className="doc-badge">
                  <FileText size={16} />
                </div>
                <div className="date-wrapper">
                  <Clock size={12} />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>

              <div className="card-body">
                <h4 className="prompt-title truncate" title={item.prompt}>
                  {item.prompt || "Scanned Homework Scan"}
                </h4>
                <p className="solution-snippet">
                  {item.solution.substring(0, 120)}...
                </p>
              </div>

              <div className="card-footer">
                <span className="load-action-text">Reload Worksheet</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .history-panel-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          height: 100%;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-icon {
          color: var(--accent-color);
        }

        .history-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .refresh-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.4rem;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .refresh-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-tertiary);
        }

        .description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          text-align: left;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 4rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top-color: var(--accent-color);
          border-radius: 50%;
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 2rem;
          gap: 1rem;
          background-color: var(--bg-secondary);
        }

        .empty-icon {
          color: var(--text-muted);
        }

        .empty-state h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .empty-state p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          max-width: 400px;
        }

        .history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .history-card {
          padding: 1.25rem;
          background-color: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          cursor: pointer;
          text-align: left;
        }

        .history-card:hover {
          transform: translateY(-2px);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .doc-badge {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background-color: var(--accent-glow);
          color: var(--accent-color);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .date-wrapper {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .prompt-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .solution-snippet {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
          height: 3.8em;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .card-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--accent-color);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
