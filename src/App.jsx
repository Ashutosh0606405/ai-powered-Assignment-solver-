import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import UploadZone from './components/UploadZone';
import ControlPanel from './components/ControlPanel';
import DocumentViewer from './components/DocumentViewer';
import ImageToPdfConverter from './components/ImageToPdfConverter';
import PdfEditor from './components/PdfEditor';
import Auth from './components/Auth';
import { solveAssignment } from './utils/gemini';
import { auth, db, isMock } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Info, ChevronRight, Sliders, UploadCloud } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('workspace');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('scribe_theme') || 'dark';
  });
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('scribe_gemini_api_key') || '';
  });
  const [model, setModel] = useState('gemini-2.5-flash');

  // Input states
  const [selectedFile, setSelectedFile] = useState(null);
  const [textPrompt, setTextPrompt] = useState('');
  
  // Output state
  const [solutionText, setSolutionText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Panel collapse states
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  // Document customizer settings
  const [settings, setSettings] = useState({
    paperStyle: 'lined',
    fontFamily: 'caveat',
    inkColor: 'blue',
    fontSize: 21,
    lineHeight: 1.6,
    wordSpacing: 0.28,
    rotationJitter: 2.2,
    verticalJitter: 1.8,
    studentName: '',
    rollNo: '',
    assignmentTitle: '',
    pageFormat: 'a4',
    paddingTop: 35,
    paddingLeft: 90
  });

  // Track Firebase/Mock Authentication State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('scribe_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Solve Action Handler + Firestore Save
  const handleSolve = async () => {
    setIsLoading(true);
    setSolutionText(''); // Clear previous

    try {
      const solution = await solveAssignment(
        selectedFile ? {
          base64: selectedFile.base64,
          mimeType: selectedFile.mimeType,
          name: selectedFile.name
        } : null,
        textPrompt,
        apiKey
      );

      setSolutionText(solution);

      // Save solved assignment history to Firestore (or local storage mock)
      if (user) {
        const assignmentData = {
          userId: user.uid,
          prompt: textPrompt || (selectedFile ? `Solved file: ${selectedFile.name}` : "Homework Scan"),
          solution: solution,
        };

        if (isMock) {
          await db.saveDocument('assignments', assignmentData);
        } else {
          // Real Firebase SDK call
          const { collection, addDoc } = await import('firebase/firestore');
          await addDoc(collection(db, 'assignments'), {
            ...assignmentData,
            createdAt: new Date().toISOString()
          });
        }
      }

    } catch (err) {
      console.error(err);
      alert(`Solving Error: ${err.message || 'Check your internet connection or API Key.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load a historical worksheet into the workspace
  const handleLoadDocument = (docItem) => {
    setSolutionText(docItem.solution);
    setTextPrompt(docItem.prompt);
    setSelectedFile(null); // Clear old attachments
    setActiveTab('workspace'); // Redirect
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0b10] text-slate-100 gap-3">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Authorizing ScribeAI session...</p>
      </div>
    );
  }

  // Redirect to Sign In if no active user profile is found
  if (!user) {
    return <Auth authInstance={auth} />;
  }

  return (
    <div className={`app-container tab-${activeTab}`}>
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        user={user}
        authInstance={auth}
      />

      {/* Main Panel content area */}
      <main className="main-content">
        {/* Top Header bar */}
        <header className="dashboard-header no-print">
          <div className="header-left">
            <h1>
              {activeTab === 'workspace' && 'Solve Workspace'}
              {activeTab === 'settings' && 'Configuration'}
            </h1>
            <p className="subtitle-header font-ui">
              {activeTab === 'workspace' && 'Convert questions into elegant hand-written worksheets.'}
              {activeTab === 'settings' && 'Configure database storage parameters and keys.'}
            </p>
          </div>
          <div className="header-right">
            {isMock ? (
              <div className="api-badge warning">
                <span className="dot"></span>
                <span>Demo (Mock Solver Active)</span>
              </div>
            ) : (
              <div className="api-badge success">
                <span className="dot"></span>
                <span>Gemini API Live</span>
              </div>
            )}
          </div>
        </header>

        {/* Workspace tab */}
        {activeTab === 'workspace' && (
          <div className="workspace-layout">
            <div className={`workspace-left no-print ${isLeftCollapsed ? 'collapsed' : ''}`}>
              <UploadZone 
                onSolve={handleSolve} 
                isLoading={isLoading} 
                selectedFile={selectedFile} 
                setSelectedFile={setSelectedFile} 
                textPrompt={textPrompt} 
                setTextPrompt={setTextPrompt} 
                onCollapse={() => setIsLeftCollapsed(true)}
              />
              
              <div className="features-info-card glass-panel">
                <h4><Info size={14} className="info-icon" /> How ScribeAI Works</h4>
                <ul>
                  <li>Scans upload PDF/JPG attachments or typed prompts.</li>
                  <li>Gemini AI generates detailed academic solutions.</li>
                  <li>Assignments are saved to your account history automatically.</li>
                  <li>Export papers to high quality print layouts.</li>
                </ul>
              </div>
            </div>

            <div className="workspace-middle">
              {/* Expand Left Panel Button Overlay */}
              {isLeftCollapsed && (
                <button 
                  className="floating-expand-btn left-expand no-print" 
                  onClick={() => setIsLeftCollapsed(false)}
                  title="Show Inputs Panel"
                >
                  <UploadCloud size={14} />
                  <span>Inputs</span>
                </button>
              )}

              <DocumentViewer 
                solutionText={solutionText} 
                settings={settings} 
                onTextEdit={setSolutionText} 
              />

              {/* Expand Right Panel Button Overlay */}
              {isRightCollapsed && (
                <button 
                  className="floating-expand-btn right-expand no-print" 
                  onClick={() => setIsRightCollapsed(false)}
                  title="Show Customizer Panel"
                >
                  <Sliders size={14} />
                  <span>Customize</span>
                </button>
              )}
            </div>

            <div className={`workspace-right no-print ${isRightCollapsed ? 'collapsed' : ''}`}>
              <ControlPanel 
                settings={settings} 
                setSettings={setSettings} 
                onPrint={handlePrint} 
                hasContent={!!solutionText} 
                onCollapse={() => setIsRightCollapsed(true)}
              />
            </div>
          </div>
        )}

        {/* PDF Generator Tab */}
        {activeTab === 'pdf-generator' && (
          <ImageToPdfConverter />
        )}

        {/* PDF Editor Tab */}
        {activeTab === 'pdf-editor' && (
          <PdfEditor 
            apiKey={apiKey}
            setSolutionText={setSolutionText}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      <style>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background-color: var(--bg-secondary);
          border-bottom: 2px solid var(--text-primary);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-left h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: -0.5px;
          text-align: left;
        }

        .subtitle-header {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 0.2rem;
        }

        .api-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .api-badge.warning {
          background-color: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .api-badge.warning .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #f59e0b;
          animation: pulse-glow-warning 2s infinite;
        }

        .api-badge.success {
          background-color: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .api-badge.success .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #10b981;
          animation: pulse-glow-success 2s infinite;
        }

        @keyframes pulse-glow-warning {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
          50% { transform: scale(1.2); box-shadow: 0 0 0 4px rgba(245, 158, 11, 0); }
        }

        @keyframes pulse-glow-success {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          50% { transform: scale(1.2); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
        }

        /* Workspace Grid Split Layout */
        .workspace-layout {
          display: flex;
          flex: 1;
          height: calc(100vh - 73px); /* Subtract header height */
          overflow: hidden;
          position: relative;
        }

        .workspace-left {
          width: 380px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
          border-right: 2px solid var(--text-primary);
          background-color: var(--bg-primary);
          transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1), padding 0.2s, opacity 0.15s, border-right 0.2s;
          opacity: 1;
          flex-shrink: 0;
        }

        .workspace-left.collapsed {
          width: 0;
          padding: 0;
          opacity: 0;
          border-right: none;
          pointer-events: none;
          overflow: hidden;
        }

        .workspace-middle {
          flex: 1;
          display: flex;
          overflow-y: auto;
          background-color: var(--bg-primary);
          position: relative;
        }

        .workspace-right {
          width: 320px;
          padding: 1.5rem;
          overflow-y: auto;
          border-left: 2px solid var(--text-primary);
          background-color: var(--bg-primary);
          transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1), padding 0.2s, opacity 0.15s, border-left 0.2s;
          opacity: 1;
          flex-shrink: 0;
        }

        .workspace-right.collapsed {
          width: 0;
          padding: 0;
          opacity: 0;
          border-left: none;
          pointer-events: none;
          overflow: hidden;
        }

        /* Floating Expand Buttons */
        .floating-expand-btn {
          position: absolute;
          top: 1.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.8rem;
          background-color: var(--bg-secondary);
          border: 2px solid var(--text-primary);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          box-shadow: 3px 3px 0px var(--text-primary);
          z-index: 50;
        }

        .floating-expand-btn:hover {
          transform: translate(-1.5px, -1.5px);
          box-shadow: 4.5px 4.5px 0px var(--text-primary);
        }

        .floating-expand-btn:active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0px var(--text-primary);
        }

        .left-expand {
          left: 1.5rem;
        }

        .right-expand {
          right: 1.5rem;
        }

        /* Help Info Card */
        .features-info-card {
          padding: 1.25rem;
          background-color: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .features-info-card h4 {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-icon {
          color: var(--accent-color);
        }

        .features-info-card ul {
          padding-left: 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.8rem;
          line-height: 1.4;
          text-align: left;
        }

        .features-info-card li strong {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

export default App;
