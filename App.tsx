
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  LayoutDashboard, 
  Bell, 
  Settings, 
  Search,
  ChevronRight,
  User as UserIcon,
  LogOut,
  Globe
} from 'lucide-react';
import { Amplify } from 'aws-amplify';

import Landing from './pages/Landing';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import Schemes from './pages/Schemes';
import SchemeDetail from './pages/SchemeDetail';
import Redirect from './pages/Redirect';
import VoiceAssistant from './components/VoiceAssistant';
import { Language, UserProfile, UserCategory } from './types';
import { getCognitoConfig } from './services/authService';
import { isAuthenticated, getCurrentUser, signOut } from './services/authService';

// Initialize Amplify with Cognito configuration
try {
  Amplify.configure(getCognitoConfig());
} catch (error) {
  console.warn('Amplify configuration incomplete - will use fallback auth', error);
}

const NavItem: React.FC<{ to: string, icon: any, label: string, active: boolean }> = ({ to, icon: Icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-[#FF9933] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </Link>
);

const AppLayout: React.FC<{ children: React.ReactNode, profile: UserProfile | null, onLogout: () => void }> = ({ children, profile, onLogout }) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-white border-r border-gray-100 flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-[#003366] p-2 rounded-lg">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#003366]">YojanaMitra AI</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem to="/dashboard" icon={Home} label="Dashboard" active={location.pathname === '/dashboard'} />
          <NavItem to="/schemes" icon={Search} label="Discover Schemes" active={location.pathname.includes('/schemes')} />
          <NavItem to="/docs" icon={FileText} label="Documentation" active={location.pathname === '/docs'} />
          <NavItem to="/profile" icon={UserIcon} label="My Profile" active={location.pathname === '/profile'} />
        </nav>

        <div className="pt-6 border-t border-gray-100 space-y-2">
          <NavItem to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="md:hidden flex items-center gap-2">
            <div className="bg-[#003366] p-1.5 rounded-lg">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-[#003366]">YojanaMitra</span>
          </div>

          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-gray-800">
              {location.pathname === '/dashboard' ? 'Overview' : 
               location.pathname.includes('/schemes') ? 'Government Schemes' : 
               location.pathname === '/docs' ? 'My Documentation' : 'Settings'}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600">
              <Globe className="w-3.5 h-3.5" />
              <span>English</span>
            </div>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-[#003366] hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-800">{profile?.name || 'Guest User'}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{profile?.category || 'No Profile'}</p>
              </div>
              <div className="w-10 h-10 bg-[#FF9933] rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {profile?.name?.charAt(0) || 'U'}
              </div>
              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Voice Assistant - Always present in App Layout */}
      <VoiceAssistant userContext={profile} />

      {/* Mobile Nav - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-40">
        <Link to="/dashboard" className={`${location.pathname === '/dashboard' ? 'text-[#003366]' : 'text-gray-400'}`}>
          <Home className="w-6 h-6" />
        </Link>
        <Link to="/schemes" className={`${location.pathname.includes('/schemes') ? 'text-[#003366]' : 'text-gray-400'}`}>
          <Search className="w-6 h-6" />
        </Link>
        <Link to="/docs" className={`${location.pathname === '/docs' ? 'text-[#003366]' : 'text-gray-400'}`}>
          <FileText className="w-6 h-6" />
        </Link>
        <Link to="/profile" className={`${location.pathname === '/profile' ? 'text-[#003366]' : 'text-gray-400'}`}>
          <UserIcon className="w-6 h-6" />
        </Link>
      </nav>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = () => {
      // Check if user is already authenticated (fallback: check localStorage/sessionStorage)
      const authToken = sessionStorage.getItem('authToken');
      const userStr = sessionStorage.getItem('user');
      const profileStr = localStorage.getItem('userProfile');

      if (authToken && userStr) {
        setIsLoggedIn(true);
        
        if (profileStr) {
          try {
            setProfile(JSON.parse(profileStr));
          } catch (e) {
            console.error('Error parsing stored profile:', e);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = (amplifyUser?: any) => {
    setIsLoggedIn(true);
    // If Amplify user object is provided, store it
    if (amplifyUser) {
      sessionStorage.setItem('user', JSON.stringify(amplifyUser));
    }
  };

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    // Persist profile to localStorage for persistence across sessions
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    
    // Clear local state
    setIsLoggedIn(false);
    setProfile(null);
    localStorage.removeItem('userProfile');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-3 bg-[#FF9933] rounded-full mb-4">
            <LayoutDashboard className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-gray-600">Loading YojanaMitra...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={!isLoggedIn ? <Landing onLogin={handleLogin} /> : <Navigate to="/profile-setup" />} />
        <Route path="/profile-setup" element={isLoggedIn && !profile ? <ProfileSetup onComplete={handleProfileComplete} /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            isLoggedIn && profile ? (
              <AppLayout profile={profile} onLogout={handleLogout}>
                <Dashboard profile={profile} />
              </AppLayout>
            ) : <Navigate to="/" />
          } 
        />
        <Route 
          path="/docs" 
          element={
            isLoggedIn && profile ? (
              <AppLayout profile={profile} onLogout={handleLogout}>
                <Documentation />
              </AppLayout>
            ) : <Navigate to="/" />
          } 
        />
        <Route 
          path="/schemes" 
          element={
            isLoggedIn && profile ? (
              <AppLayout profile={profile} onLogout={handleLogout}>
                <Schemes userProfile={profile} />
              </AppLayout>
            ) : <Navigate to="/" />
          } 
        />
        <Route 
          path="/schemes/:id" 
          element={
            isLoggedIn && profile ? (
              <AppLayout profile={profile} onLogout={handleLogout}>
                <SchemeDetail />
              </AppLayout>
            ) : <Navigate to="/" />
          } 
        />
        <Route 
          path="/redirect" 
          element={
            isLoggedIn && profile ? (
              <AppLayout profile={profile} onLogout={handleLogout}>
                <Redirect />
              </AppLayout>
            ) : <Navigate to="/" />
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
