import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
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
  const [theme, setTheme] = useState('dark');
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

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse move listener to update coordinates for ambient cursor glow
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      {/* Dynamic Cursor Light Overlay */}
      <div 
        className="mouse-glow" 
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px` 
        }} 
      />

      {/* Drifting Neon Ambient Glow Blobs */}
      <div className="ambient-glow-blob blob-indigo no-print" />
      <div className="ambient-glow-blob blob-violet no-print" />
      <div className="ambient-glow-blob blob-cyan no-print" />

      {/* Background Chalk Doodles */}
      <div className="bg-doodles-wrapper no-print">
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

        {/* 8. Math Variables Doodle (x, y, z) */}
        <svg viewBox="0 0 100 40" className="bg-doodle bg-doodle-8">
          <text x="5" y="25" fontFamily="'Space Mono', monospace" fontSize="18" fontWeight="bold" fill="currentColor">x, y, z</text>
        </svg>

        {/* 9. Derivative Math Doodle (dy/dx) */}
        <svg viewBox="0 0 100 40" className="bg-doodle bg-doodle-9">
          <text x="5" y="25" fontFamily="'Space Mono', monospace" fontSize="16" fontWeight="bold" fill="currentColor">dy/dx</text>
        </svg>

        {/* 10. Math Limit Doodle (lim n→∞) */}
        <svg viewBox="0 0 120 40" className="bg-doodle bg-doodle-10">
          <text x="5" y="25" fontFamily="'Space Mono', monospace" fontSize="14" fontWeight="bold" fill="currentColor">lim(n→∞)</text>
        </svg>

        {/* 11. Math Summation Sigma Doodle */}
        <svg viewBox="0 0 60 60" className="bg-doodle bg-doodle-11">
          <text x="5" y="45" fontFamily="'Space Mono', monospace" fontSize="32" fontWeight="bold" fill="currentColor">∑</text>
          <text x="32" y="30" fontFamily="'Space Mono', monospace" fontSize="12" fontWeight="bold" fill="currentColor">n</text>
        </svg>

        {/* 12. Constant Pi Doodle */}
        <svg viewBox="0 0 100 40" className="bg-doodle bg-doodle-12">
          <text x="5" y="25" fontFamily="'Space Mono', monospace" fontSize="16" fontWeight="bold" fill="currentColor">π ≈ 3.14</text>
        </svg>

        {/* 13. Imaginary Unit Doodle (√-1 = i) */}
        <svg viewBox="0 0 100 40" className="bg-doodle bg-doodle-13">
          <text x="5" y="25" fontFamily="'Space Mono', monospace" fontSize="16" fontWeight="bold" fill="currentColor">√-1 = i</text>
        </svg>
      </div>

      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user}
        authInstance={auth}
        isMock={isMock}
      />

      {/* Main Panel content area */}
      <main className="main-content">

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
          background-color: var(--bg-secondary) !important;
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

        /* Workspace Immersive Desk Layout */
        .workspace-layout {
          display: flex;
          flex: 1;
          height: calc(100vh - 65px);
          overflow: hidden;
          position: relative;
          padding: 0;
          box-sizing: border-box;
        }

        .workspace-left {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          bottom: 1.5rem;
          width: 360px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
          border: 2px solid var(--text-primary) !important;
          border-radius: var(--radius-md) !important;
          box-shadow: 6px 6px 0px var(--text-primary) !important;
          background-color: var(--bg-secondary) !important;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s;
          opacity: 1;
          z-index: 80;
          transform: translateX(0);
        }

        .workspace-left.collapsed {
          transform: translateX(-120%);
          opacity: 0;
          pointer-events: none;
        }

        .workspace-middle {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          overflow-y: auto;
          background-color: transparent !important;
          position: relative;
          z-index: 10;
          padding: 2rem 0;
          box-sizing: border-box;
        }

        .workspace-right {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          bottom: 1.5rem;
          width: 320px;
          padding: 1.5rem;
          overflow-y: auto;
          border: 2px solid var(--text-primary) !important;
          border-radius: var(--radius-md) !important;
          box-shadow: 6px 6px 0px var(--text-primary) !important;
          background-color: var(--bg-secondary) !important;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s;
          opacity: 1;
          z-index: 80;
          transform: translateX(0);
        }

        .workspace-right.collapsed {
          transform: translateX(120%);
          opacity: 0;
          pointer-events: none;
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
