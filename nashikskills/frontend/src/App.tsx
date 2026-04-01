import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
  UserRole,
  getUserRole,
  setUserRole,
  handleFirestoreError,
  OperationType
} from './firebase';
import { Navbar } from './components/Navbar';
import { Ticker } from './components/Ticker';
import { HomeView } from './components/HomeView';
import { AuthView } from './components/auth/AuthView';
import { RoleGuard } from './components/auth/RoleGuard';
import { getDashboardPathForRole } from './components/auth/roleUtils';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentLearningPage } from './pages/student/StudentLearningPage';
import { StudentResourcesPage } from './pages/student/StudentResourcesPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { IndustryDashboardPage } from './pages/industry/IndustryDashboardPage';
import { IndustryPostPage } from './pages/industry/IndustryPostPage';
import { IndustryCandidatesPage } from './pages/industry/IndustryCandidatesPage';
import { AcademicDashboardPage } from './pages/academic/AcademicDashboardPage';
import { AcademicStudentsPage } from './pages/academic/AcademicStudentsPage';
import { AcademicReportsPage } from './pages/academic/AcademicReportsPage';
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
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole | null>(null);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [responses, setResponses] = useState<IndustryResponse[]>(INITIAL_RESPONSES);
  const [counts, setCounts] = useState({ ind: 12, stu: 87 });
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextIsDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDarkMode(nextIsDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme-mode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setNeedsRoleSelection(false);
      if (u) {
        try {
          const role = await getUserRole(u.uid);
          setUserRoleState(role);
          if (!role) {
            setNeedsRoleSelection(true);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `user_profiles/${u.uid}`);
        }

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
        setUserRoleState(null);
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

  useEffect(() => {
    if (!isAuthReady) return;
    if (!user) {
      if (location.pathname.includes('dashboard')) {
        navigate('/auth', { replace: true });
      }
      return;
    }
    if (userRole && location.pathname === '/auth') {
      navigate(getDashboardPathForRole(userRole), { replace: true });
    }
  }, [isAuthReady, user, userRole, location.pathname, navigate]);

  const handleEmailLogin = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const handleRegister = async (email: string, password: string, role: UserRole) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setUserRole(cred.user.uid, role, {
      email: cred.user.email,
      displayName: cred.user.displayName,
    });
    setUserRoleState(role);
    navigate(getDashboardPathForRole(role), { replace: true });
  };

  const handleRoleSelection = async (role: UserRole) => {
    if (!user) return;
    await setUserRole(user.uid, role, {
      email: user.email,
      displayName: user.displayName,
    });
    setUserRoleState(role);
    setNeedsRoleSelection(false);
    navigate(getDashboardPathForRole(role), { replace: true });
  };

  const currentView = (() => {
    if (location.pathname === '/home' || location.pathname === '/') return 'home';
    if (location.pathname.endsWith('/dashboard')) return 'dashboard';
    if (location.pathname === '/student/learning') return 'learning';
    if (location.pathname === '/student/resources') return 'resources';
    if (location.pathname === '/student/profile') return 'profile';
    if (location.pathname === '/industry/post') return 'post';
    if (location.pathname === '/industry/candidates') return 'candidates';
    if (location.pathname === '/industry/reports') return 'insights';
    if (location.pathname === '/academic/students') return 'students';
    if (location.pathname === '/academic/reports') return 'reports';
    if (location.pathname === '/academic/insights') return 'insights';
    return 'home';
  })();

  const setViewFromNavbar = (nextView: string) => {
    setView(nextView);
    if (nextView === 'home') navigate('/home');
    if (nextView === 'dashboard') {
      if (userRole) {
        navigate(getDashboardPathForRole(userRole));
      } else {
        navigate('/auth');
      }
    }
    if (userRole === 'student') {
      if (nextView === 'learning') navigate('/student/learning');
      if (nextView === 'resources') navigate('/student/resources');
      if (nextView === 'profile') navigate('/student/profile');
    }
    if (userRole === 'industry') {
      if (nextView === 'post') navigate('/industry/post');
      if (nextView === 'candidates') navigate('/industry/candidates');
      if (nextView === 'insights') navigate('/industry/dashboard');
    }
    if (userRole === 'academic') {
      if (nextView === 'students') navigate('/academic/students');
      if (nextView === 'reports') navigate('/academic/reports');
      if (nextView === 'insights') navigate('/academic/dashboard');
    }
    if (!userRole) {
      if (nextView === 'student') navigate('/auth');
      if (nextView === 'resources') navigate('/auth');
      if (nextView === 'submit') navigate('/auth');
      if (nextView === 'about') navigate('/home');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg text-text selection:bg-lime/30">
        <Navbar 
          currentView={currentView} 
          setView={setViewFromNavbar} 
          user={user} 
          userRole={userRole}
          onLogin={handleLogin} 
          onLogout={handleLogout} 
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(prev => !prev)}
        />
        <Ticker />
        
        <main className="pt-0">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomeView key="home" setView={setViewFromNavbar} />} />
              <Route
                path="/auth"
                element={<AuthView onGoogleLogin={handleLogin} onEmailLogin={handleEmailLogin} onRegister={handleRegister} />}
              />
              <Route
                path="/dashboard"
                element={userRole ? <Navigate to={getDashboardPathForRole(userRole)} replace /> : <Navigate to="/auth" replace />}
              />

              <Route
                path="/student/dashboard"
                element={
                  <RoleGuard user={user} role={userRole} allowedRoles={['student']}>
                    <StudentDashboardPage user={user} profile={profile} onLogin={handleLogin} />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/learning"
                element={
                  <RoleGuard user={user} role={userRole} allowedRoles={['student']}>
                    <StudentLearningPage user={user} profile={profile} onLogin={handleLogin} />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/resources"
                element={
                  <RoleGuard user={user} role={userRole} allowedRoles={['student']}>
                    <StudentResourcesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <RoleGuard user={user} role={userRole} allowedRoles={['student']}>
                    <StudentProfilePage user={user} profile={profile} onProfileUpdate={setProfile} />
                  </RoleGuard>
                }
              />

              <Route
                path="/industry/dashboard"
                element={
                  <RoleGuard user={user} role={userRole} allowedRoles={['industry']}>
                    <IndustryDashboardPage responses={responses} counts={counts} />
                  </RoleGuard>
                }
              />
              <Route
                path="/industry/post"
                element={
                  <RoleGuard user={user} role={userRole} allowedRoles={['industry']}>
                    <IndustryPostPage user={user} profile={profile} onProfileUpdate={setProfile} />
                  </RoleGuard>
                }
              />
              <Route
                path="/industry/candidates"
                element={
                  <RoleGuard user={user} role={userRole} allowedRoles={['industry']}>
                    <IndustryCandidatesPage />
                  </RoleGuard>
                }
              />

              <Route
                path="/academic/dashboard"
                element={
                  <RoleGuard user={user} role={userRole} allowedRoles={['academic']}>
                    <AcademicDashboardPage responses={responses} counts={counts} />
                  </RoleGuard>
                }
              />
              <Route
                path="/academic/students"
                element={
                  <RoleGuard user={user} role={userRole} allowedRoles={['academic']}>
                    <AcademicStudentsPage user={user} profile={profile} onProfileUpdate={setProfile} />
                  </RoleGuard>
                }
              />
              <Route
                path="/academic/reports"
                element={
                  <RoleGuard user={user} role={userRole} allowedRoles={['academic']}>
                    <AcademicReportsPage />
                  </RoleGuard>
                }
              />

              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </AnimatePresence>

          {user && needsRoleSelection ? (
            <div className="fixed inset-0 z-[300] bg-bg/85 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="w-full max-w-md bg-s1 border border-b1 rounded-2xl p-6">
                <div className="mono-label text-lime mb-2">Select role</div>
                <h3 className="text-xl font-serif mb-2">Complete your account setup</h3>
                <p className="text-muted text-sm mb-5">Choose the role that best matches your use-case.</p>
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={() => handleRoleSelection('student')} className="px-4 py-2.5 rounded-lg bg-s2 border border-b2 text-left hover:border-lime">Student</button>
                  <button onClick={() => handleRoleSelection('industry')} className="px-4 py-2.5 rounded-lg bg-s2 border border-b2 text-left hover:border-lime">Industry</button>
                  <button onClick={() => handleRoleSelection('academic')} className="px-4 py-2.5 rounded-lg bg-s2 border border-b2 text-left hover:border-lime">Academic Institute</button>
                </div>
              </div>
            </div>
          ) : null}
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
