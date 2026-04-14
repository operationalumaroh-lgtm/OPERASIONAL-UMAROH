/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Footer } from './components/Footer';
import { Navbar, TabType } from './components/Navbar';
import { DatabaseView } from './components/DatabaseView';
import { DashboardView } from './components/DashboardView';
import { MappingPaketJadiView } from './components/MappingPaketJadiView';
import { TemplatesView } from './components/TemplatesView';
import { SalesOrderView } from './components/SalesOrderView';
import { FlightMonitoringView } from './components/FlightMonitoringView';
import { TrackerView } from './components/TrackerView';
import { TourLeaderPortal } from './components/TourLeaderPortal';
import { ManifestPage } from './components/manifest/ManifestPage';
import { RevenueReport } from './components/RevenueReport';
import { LoginView, Role } from './components/LoginView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { logoBase64 } from './utils/logoBase64';
import { LogOut, User } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(() => {
    return localStorage.getItem('userRole') as Role | null;
  });
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return (localStorage.getItem('activeTab') as TabType) || 'dashboard';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (role: Role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    
    const initialTab = role === 'mitra' ? 'templates' : 'dashboard';
    setActiveTab(initialTab);
    localStorage.setItem('activeTab', initialTab);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      localStorage.removeItem('userRole');
      localStorage.removeItem('activeTab');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={handleTabChange} />;
      case 'database':
        return <DatabaseView />;
      case 'templates':
        return <TemplatesView />;
      case 'mapping':
        return <MappingPaketJadiView />;
      case 'sales-order':
        return <SalesOrderView />;
      case 'flights':
        return <FlightMonitoringView />;
      case 'tracker':
        return <TrackerView />;
      case 'manifest':
        return <ManifestPage />;
      case 'revenue':
        return <RevenueReport />;
      case 'tl-portal':
        return <TourLeaderPortal />;
      default:
        return <DashboardView onNavigate={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* Hero Section */}
      <header className="bg-white text-gray-900 py-12 relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 opacity-5 bg-[url('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />
        
        {/* User Info & Logout */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              {userRole === 'operasional' ? 'Operasional' : 'Mitra Dev'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm transition-colors text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-4">
              <img src={logoBase64} alt="Umaroh Logo" className="h-12" />
            </div>
            <p className="text-gray-500 text-lg max-w-2xl font-medium">
              Platform Digital Penyedia Layanan Satu Atap Bisnis Perjalanan Umrah
            </p>
            <div className="mt-6 flex gap-4">
              <div className="bg-amber-500 text-black px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-sm">
                pricelist dan sales order
              </div>
            </div>
          </div>
        </div>
      </header>

      <Navbar activeTab={activeTab} onTabChange={handleTabChange} userRole={userRole} />

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <ErrorBoundary>
          {renderContent()}
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
}

export default App;

