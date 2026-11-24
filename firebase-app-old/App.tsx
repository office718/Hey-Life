
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AcademyPage from './pages/AcademyPage';
import ChallengesPage from './pages/ChallengesPage';
import CommunityPage from './pages/CommunityPage';
import MyPlanPage from './pages/MyPlanPage';
import SettingsPage from './pages/SettingsPage';
import SessionDetailsPage from './pages/SessionDetailsPage';
import AdminPage from './pages/AdminPage';
import MainLayout from './layouts/MainLayout';
import WelcomePage from './pages/WelcomePage';
import OnboardingPage from './pages/OnboardingPage';
import { User, AppNotification } from './types';
import LearningGroupPage from './pages/LearningGroupPage';
import WorkoutOnboardingPage from './pages/WorkoutOnboardingPage';
import WorkoutPlanPage from './pages/WorkoutPlanPage';
import { getFirebaseServices } from './firebase/firebaseConfig';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import LeaderDashboardPage from './pages/LeaderDashboardPage';
import GivingPage from './pages/GivingPage';
import { LanguageProvider } from './contexts/LanguageContext';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import { getUserNotifications, updateUserData, seedInitialData } from './services/firebaseService';
import DataSyncPage from './pages/DataSyncPage';
import ChallengeDetailsPage from './pages/ChallengeDetailsPage';
import HeyFamPage from './pages/HeyFamPage';
import JournalPage from './pages/JournalPage';
import AssessmentPage from './pages/AssessmentPage';
import ScrollToTop from './components/ScrollToTop';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  notifications: AppNotification[];
  unreadCount: number;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("App Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-hey-church-bg min-h-screen flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="bg-hey-church-red/20 p-6 rounded-3xl border border-hey-church-red/30 max-w-md">
            <h2 className="text-2xl font-black uppercase italic mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-6">Coach Victor encountered an unexpected issue. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-hey-church-red text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest hover:bg-hey-church-red/80 transition-all"
            >
              Refresh App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => useContext(AuthContext)!;

const AppContent: React.FC = () => {
  const { user, loading, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const initialLandingDone = useRef(false);
  const [showRetry, setShowRetry] = useState(false);
  
  useEffect(() => {
    // Handle Invite Redirection logic
    const currentHash = window.location.hash;
    const challengeInviteMatch = currentHash.match(/#\/challenges\/([^?]+)\?invite=true/);
    
    if (challengeInviteMatch && !user) {
        const challengeId = challengeInviteMatch[1];
        sessionStorage.setItem('pendingInviteChallengeId', challengeId);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && user && user.onboarded && !initialLandingDone.current) {
      const pendingInvite = sessionStorage.getItem('pendingInviteChallengeId');
      if (pendingInvite) {
          sessionStorage.removeItem('pendingInviteChallengeId');
          navigate(`/challenges/${pendingInvite}?invite=true`, { replace: true });
      } else {
          navigate('/home', { replace: true });
      }
      initialLandingDone.current = true;
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    let timer: any;
    if (loading) {
      timer = setTimeout(() => setShowRetry(true), 8000);
    } else {
      setShowRetry(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
     return (
      <div className="bg-hey-church-bg min-h-screen flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-hey-church-red/20 rounded-full blur-3xl animate-pulse"></div>
          <svg className="animate-spin h-12 w-12 text-hey-church-red relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        <h2 className="mt-8 text-xl font-black uppercase italic tracking-widest">Coach Victor is Preparing...</h2>
        <p className="mt-2 text-sm text-gray-400 max-w-xs">We're syncing your latest performance data from the vault.</p>
        
        {showRetry && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-xs text-hey-church-yellow mb-4 font-bold uppercase tracking-tighter">Taking longer than expected?</p>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-white/10"
              >
                Refresh Page
              </button>
              {firebaseUser && (
                <button 
                  onClick={() => {
                    const { auth } = getFirebaseServices();
                    signOut(auth);
                  }}
                  className="text-gray-500 hover:text-white text-[10px] font-bold uppercase tracking-widest"
                >
                  Sign Out & Try Again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </>
      ) : !user.onboarded ? (
        <>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </>
      ) : (
        <>
          <Route path="/workout-onboarding" element={<WorkoutOnboardingPage />} />
          <Route path="/workout-plan" element={<WorkoutPlanPage />} />
          <Route path="/leader-dashboard" element={<LeaderDashboardPage />} />
          <Route path="/giving" element={<GivingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          
          {user.role === 'admin' && (
            <>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/sync" element={<DataSyncPage />} />
            </>
          )}
          
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/academy" element={<AcademyPage />} />
            <Route path="/academy/group/:groupId" element={<LearningGroupPage />} />
            <Route path="/academy/:courseId/session/:sessionId" element={<SessionDetailsPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/challenges/:challengeId" element={<ChallengeDetailsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/fam/:famId" element={<HeyFamPage />} />
            <Route path="/my-plan" element={<MyPlanPage />} />
            <Route path="/journal" element={<JournalPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </>
      )}
    </Routes>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const { auth, db } = getFirebaseServices();
    seedInitialData().catch(console.error);

    let unsubscribeUser: (() => void) | undefined;
    let unsubscribeNotifications: (() => void) | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (unsubscribeUser) unsubscribeUser();
        if (unsubscribeNotifications) unsubscribeNotifications();
        if (timeoutId) clearTimeout(timeoutId);
        
        if (fbUser) {
            setFirebaseUser(fbUser);
            setLoading(true);
            let timedOut = false;

            timeoutId = setTimeout(() => {
                timedOut = true;
                console.warn("User document fetch timed out. Signing out.");
                signOut(auth);
            }, 30000);

            const userDocRef = doc(db, 'users', fbUser.uid);
            unsubscribeUser = onSnapshot(userDocRef, (docSnapshot) => {
                clearTimeout(timeoutId);
                if (timedOut) return;

                if (docSnapshot.exists()) {
                    const userData = { id: docSnapshot.id, ...docSnapshot.data() } as User;
                    // Ensure specific emails are always admins
                    const adminEmails = ['admin@heychurch.de', 'office@heychurch.de'];
                    if (adminEmails.includes(fbUser.email || '') && userData.role !== 'admin') {
                        updateUserData(fbUser.uid, { role: 'admin' });
                        userData.role = 'admin'; 
                    }
                    setUser(userData);
                    setLoading(false);

                    if (unsubscribeNotifications) unsubscribeNotifications();
                    const notificationsQuery = getUserNotifications(fbUser.uid);
                    unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
                        const fetchedNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
                        fetchedNotifications.sort((a, b) => {
                            const timeA = a.createdAt && typeof a.createdAt === 'object' && 'toMillis' in a.createdAt ? a.createdAt.toMillis() : new Date(a.createdAt as string).getTime();
                            const timeB = b.createdAt && typeof b.createdAt === 'object' && 'toMillis' in b.createdAt ? b.createdAt.toMillis() : new Date(b.createdAt as string).getTime();
                            return timeB - timeA;
                        });
                        setNotifications(fetchedNotifications);
                    });
                } else {
                    // User exists in Auth but not in Firestore - redirect to onboarding
                    console.warn("User document does not exist in Firestore. Redirecting to onboarding.");
                    setUser({ id: fbUser.uid, onboarded: false } as User);
                    setLoading(false);
                }
            }, (error) => {
                clearTimeout(timeoutId);
                if (timedOut) return;
                setLoading(false);
            });
        } else {
            setFirebaseUser(null);
            setUser(null);
            setLoading(false);
        }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeUser) unsubscribeUser();
        if (unsubscribeNotifications) unsubscribeNotifications();
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <LanguageProvider user={user}>
      <AuthContext.Provider value={{ 
          user, 
          firebaseUser, 
          loading, 
          notifications, 
          unreadCount: notifications.filter(n => !n.isRead).length 
      }}>
        <HashRouter>
          <ScrollToTop />
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </HashRouter>
      </AuthContext.Provider>
    </LanguageProvider>
  );
};

export default App;

export const SetupRouter: React.FC<{ error?: string; source?: string }> = ({ error, source }) => (
  <HashRouter>
    <Routes>
      <Route path="*" element={<SetupPage error={error} source={source} />} />
    </Routes>
  </HashRouter>
);
