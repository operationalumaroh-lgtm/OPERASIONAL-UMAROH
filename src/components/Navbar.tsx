import React, { useState } from 'react';
import { Database, FileSpreadsheet, ShoppingCart, LayoutDashboard, Hotel, Bell, Plane, Menu, X, MapPin, FileText, TrendingUp } from 'lucide-react';
import { Role } from './LoginView';

export type TabType = 'dashboard' | 'database' | 'templates' | 'mapping' | 'sales-order' | 'flights' | 'tracker' | 'manifest' | 'revenue' | 'tl-portal' | 'inventory' | 'finance';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  userRole: Role | null;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, userRole }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const allNavItems: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'templates', label: 'Templates', icon: FileSpreadsheet },
    { id: 'mapping', label: 'Mapping Pembayaran & Booking', icon: Hotel },
    { id: 'sales-order', label: 'Sales Order', icon: ShoppingCart },
    { id: 'flights', label: 'Monitoring Penerbangan', icon: Plane },
    { id: 'tracker', label: 'Mapping & Tracker Paket, Jamaah & Keberangkatan', icon: MapPin },
    { id: 'manifest', label: 'Generate Manifest', icon: FileText },
    { id: 'revenue', label: 'Laporan Pendapatan', icon: TrendingUp },
    { id: 'tl-portal', label: 'Portal TL (Mobile)', icon: MapPin },
    { id: 'inventory', label: 'Inventory & Gudang', icon: Database },
    { id: 'finance', label: 'Tagihan Vendor (AP)', icon: TrendingUp },
  ];

  const navItems = userRole === 'mitra' 
    ? allNavItems.filter(item => item.id === 'templates' || item.id === 'flights')
    : allNavItems;

  const handleTabClick = (id: TabType) => {
    onTabChange(id);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between min-h-[4rem] py-2">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-wrap gap-2 flex-grow justify-center items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${isActive 
                      ? 'bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-600/20' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button className="relative p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                      ${isActive 
                        ? 'bg-amber-50 text-amber-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

