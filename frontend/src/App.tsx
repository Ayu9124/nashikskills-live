import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signInWithPopup, 
  googleProvider, 
  signOut, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit, 
  doc, 
  getDoc,
  User,
  handleFirestoreError,
  OperationType
} from './firebase';
import { Navbar } from './components/Navbar';
import { Ticker } from './components/Ticker';
import { HomeView } from './components/HomeView';
import { DashboardView } from './components/DashboardView';
import { StudentView } from './components/StudentView';
import { SubmitView } from './components/SubmitView';
import { ResourcesView } from './components/ResourcesView';
import { AboutView } from './components/AboutView';
import { Response as IndustryResponse } from './types';
import { INITIAL_RESPONSES } from './data';

// --- Error Boundary ---

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-8 text-center border-t-4 border-coral">
          <div className="max-w-md">
            <h1 className="font-serif text-3xl mb-4 text-coral">Something went wrong</h1>
            <p className="text-muted text-sm mb-6">We encountered an unexpected error. Please try refreshing the page.</p>
            <pre className="text-[10px] bg-s1 p-4 rounded text-left overflow-auto max-h-40 border border-b1 mb-6">
              {this.state.error?.message}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-lime text-bg rounded-lg text-sm font-bold"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

// --- Main App ---

export default function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [responses, setResponses] = useState<IndustryResponse[]>(INITIAL_RESPONSES);
  const [counts, setCounts] = useState({ ind: 12, stu: 87 });
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch profile
        const path = `student_profiles/${u.uid}`;
        try {
          const docRef = doc(db, 'student_profiles', u.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, path);
        }
      } else {
        setProfile(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listener for Industry Responses
  useEffect(() => {
    const q = query(collection(db, 'industry_responses'), orderBy('createdAt', 'desc'), limit(10));
    const path = 'industry_responses';
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newResponses = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          co: data.co || 'Unknown',
          sec: data.sec || 'Other',
          gap: data.gap || 75,
          t: data.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'
        } as IndustryResponse;
      });
      
      if (newResponses.length > 0) {
        setResponses([...newResponses, ...INITIAL_RESPONSES].slice(0, 10));
        setCounts(prev => ({ ...prev, ind: 12 + snapshot.size }));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        // Silently handle popup closure by user
        return;
      }
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg text-text selection:bg-lime/30">
        <Navbar 
          currentView={view} 
          setView={setView} 
          user={user} 
          onLogin={handleLogin} 
          onLogout={handleLogout} 
        />
        <Ticker />
        
        <main className="pt-0">
          <AnimatePresence mode="wait">
            {view === 'home' && <HomeView key="home" setView={setView} /> as any}
            {view === 'dashboard' && <DashboardView key="dashboard" responses={responses} counts={counts} /> as any}
            {view === 'student' && <StudentView key="student" user={user} profile={profile} onLogin={handleLogin} /> as any}
            {view === 'resources' && <ResourcesView key="resources" /> as any}
            {view === 'submit' && <SubmitView key="submit" user={user} profile={profile} onProfileUpdate={setProfile} /> as any}
            {view === 'about' && <AboutView key="about" /> as any}
          </AnimatePresence>
        </main>

        <footer className="py-12 px-8 border-t border-b1 bg-s1">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="logo-serif text-[15px]">
              Nashik<span className="text-lime">Skills</span><sub>LIVE</sub>
            </div>
            <div className="flex gap-8 text-[11px] text-muted font-mono uppercase tracking-widest">
              <a href="#" className="hover:text-lime transition-colors">Privacy</a>
              <a href="#" className="hover:text-lime transition-colors">Terms</a>
              <a href="#" className="hover:text-lime transition-colors">Contact</a>
            </div>
            <div className="text-[11px] text-muted font-mono">
              © 2026 NashikSkills Live. Built for IDS 6.0.
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
