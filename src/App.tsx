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
import { InventoryView } from './components/inventory/InventoryView';
import { FinanceDashboard } from './components/finance/FinanceDashboard';
import { LoginView, Role } from './components/LoginView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardOperasional } from './components/DashboardOperasional';
import { DashboardMitra } from './components/DashboardMitra';
import { DashboardJamaah } from './components/DashboardJamaah';
import { RegisterMitraView } from './components/RegisterMitraView';
import { ValidasiMitraView } from './components/ValidasiMitraView';
import { logoBase64 } from './utils/logoBase64';
import { LogOut, User, Settings, Users } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [subRole, setSubRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [adminViewMode, setAdminViewMode] = useState<'operasional' | 'mitra' | 'jamaah'>('operasional');
  const [showRegisterMitra, setShowRegisterMitra] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email);
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role as Role);
            setSubRole(data.subRole || null);
            
            // Set initial tab based on role
            if (data.role === 'mitra') setActiveTab('dashboard-mitra' as any);
            else if (data.role === 'jamaah') setActiveTab('dashboard-jamaah' as any);
            else setActiveTab('dashboard');
          } else {
            // If user doc doesn't exist yet (during registration), we wait for onLogin
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setSubRole(null);
        setUserEmail(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const isMasterAdmin = userEmail === 'operationalumaroh@gmail.com';

  const handleLogin = (role: Role, subRole?: string) => {
    setUserRole(role);
    if (subRole) setSubRole(subRole);
    
    if (role === 'mitra') setActiveTab('dashboard-mitra' as any);
    else if (role === 'jamaah') setActiveTab('dashboard-jamaah' as any);
    else setActiveTab('dashboard');
    
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      setSubRole(null);
      setUserEmail(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!isLoggedIn || (!userRole && !isMasterAdmin)) {
    if (showRegisterMitra) {
      return <RegisterMitraView onBack={() => setShowRegisterMitra(false)} />;
    }
    return <LoginView onLogin={handleLogin} onGoToRegister={() => setShowRegisterMitra(true)} />;
  }

  const renderContent = () => {
    if (isMasterAdmin) {
      if (adminViewMode === 'mitra') return <DashboardMitra />;
      if (adminViewMode === 'jamaah') return <DashboardJamaah />;
      // else fall through to operasional routes
    } else {
      // Route based on role first
      if (userRole === 'mitra') return <DashboardMitra />;
      if (userRole === 'jamaah') return <DashboardJamaah />;
    }

    // Operasional / Admin routes
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={handleTabChange} />;
      case 'validasi-mitra':
        return <ValidasiMitraView />;
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
      case 'inventory':
        return <InventoryView />;
      case 'finance':
        return <FinanceDashboard />;
      default:
        return <DashboardView onNavigate={handleTabChange} />;
    }
  };

  const getRoleDisplay = () => {
    if (isMasterAdmin) return 'Master Admin';
    if (userRole === 'admin') return 'Administrator';
    if (userRole === 'mitra') return 'Mitra Travel';
    if (userRole === 'jamaah') return 'Jamaah';
    if (userRole === 'operasional') {
      return subRole ? `Ops - ${subRole}` : 'Operasional';
    }
    return 'User';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col relative pb-20">
      {/* Hero Section */}
      <header className="bg-white text-gray-900 py-12 relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 opacity-5 bg-[url('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />
        
        {/* User Info & Logout */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              {getRoleDisplay()}
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
          </div>
        </div>
      </header>

      {(userRole === 'operasional' || userRole === 'admin' || isMasterAdmin) && (!isMasterAdmin || adminViewMode === 'operasional') && (
        <Navbar activeTab={activeTab} onTabChange={handleTabChange} userRole={userRole || 'admin'} />
      )}

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <ErrorBoundary>
          {renderContent()}
        </ErrorBoundary>
      </main>

      <Footer />

      {/* Master Admin Switcher */}
      {isMasterAdmin && (
        <div className="fixed bottom-6 right-6 z-50 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 p-1.5 flex gap-1 items-center">
          <div className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-r border-gray-200 mr-1">
            View As
          </div>
          <button
            onClick={() => setAdminViewMode('operasional')}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${adminViewMode === 'operasional' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Settings className="w-4 h-4" /> Operasional
          </button>
          <button
            onClick={() => setAdminViewMode('mitra')}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${adminViewMode === 'mitra' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Users className="w-4 h-4" /> Mitra
          </button>
          <button
            onClick={() => setAdminViewMode('jamaah')}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${adminViewMode === 'jamaah' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <User className="w-4 h-4" /> Jamaah
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

