import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore';

// Default Firebase Configuration (Placeholder values)
// If the user wants to use a live Firebase instance, they can replace these keys.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let auth;
let db;
let isMock = false;

// If config keys are missing, ScribeAI falls back to a high-fidelity Local Storage simulation
// so the application runs completely out-of-the-box for any user without configuration fatigue.
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "") {
  isMock = true;
  console.log("Firebase config not found. Running ScribeAI in Local Simulation Mode.");

  // 1. Mock Authentication Service
  auth = {
    currentUser: JSON.parse(localStorage.getItem('scribe_mock_user')) || null,
    listeners: [],
    
    onAuthStateChanged(callback) {
      this.listeners.push(callback);
      // Trigger initial callback with current user state
      callback(this.currentUser);
      return () => {
        this.listeners = this.listeners.filter(l => l !== callback);
      };
    },

    async createUserWithEmailAndPassword(email, password) {
      if (email.length < 5 || password.length < 6) {
        throw new Error("Invalid credentials. Password must be at least 6 characters.");
      }
      
      const users = JSON.parse(localStorage.getItem('scribe_mock_users') || '[]');
      if (users.find(u => u.email === email)) {
        throw new Error("Email already registered.");
      }

      const newUser = { uid: 'usr_' + Math.random().toString(36).substr(2, 9), email };
      users.push({ ...newUser, password });
      localStorage.setItem('scribe_mock_users', JSON.stringify(users));

      this.currentUser = newUser;
      localStorage.setItem('scribe_mock_user', JSON.stringify(newUser));
      this.listeners.forEach(l => l(newUser));
      return { user: newUser };
    },

    async signInWithEmailAndPassword(email, password) {
      const users = JSON.parse(localStorage.getItem('scribe_mock_users') || '[]');
      // For developer mock convenience, match user by email and auto-update password if it has changed
      let userMatch = users.find(u => u.email === email);
      
      if (!userMatch) {
        throw new Error("Invalid email or password combination.");
      }

      if (userMatch.password !== password) {
        userMatch.password = password;
        localStorage.setItem('scribe_mock_users', JSON.stringify(users));
      }

      const loggedInUser = { uid: userMatch.uid, email: userMatch.email };
      this.currentUser = loggedInUser;
      localStorage.setItem('scribe_mock_user', JSON.stringify(loggedInUser));
      this.listeners.forEach(l => l(loggedInUser));
      return { user: loggedInUser };
    },

    async signOut() {
      this.currentUser = null;
      localStorage.removeItem('scribe_mock_user');
      this.listeners.forEach(l => l(null));
    }
  };

  // 2. Mock Firestore Database
  db = {
    // Simulated Firestore actions
    async saveDocument(colName, data) {
      const records = JSON.parse(localStorage.getItem(`scribe_col_${colName}`) || '[]');
      const newRecord = {
        id: 'doc_' + Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString()
      };
      records.push(newRecord);
      localStorage.setItem(`scribe_col_${colName}`, JSON.stringify(records));
      return newRecord;
    },

    async getDocuments(colName, userId) {
      const records = JSON.parse(localStorage.getItem(`scribe_col_${colName}`) || '[]');
      // Filter by user ID if applicable
      const filtered = records.filter(r => r.userId === userId);
      // Sort descending by creation date
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

} else {
  // Initialize Real Firebase services
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db, isMock };
export { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit
};
