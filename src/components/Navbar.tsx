import React from 'react';
import { Database, FileSpreadsheet, ShoppingCart, LayoutDashboard, Hotel, Bell, Plane } from 'lucide-react';
import { Role } from './LoginView';

export type TabType = 'dashboard' | 'database' | 'templates' | 'mapping' | 'sales-order' | 'flights';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  userRole: Role | null;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, userRole }) => {
  const allNavItems: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'templates', label: 'Templates', icon: FileSpreadsheet },
    { id: 'mapping', label: 'Mapping Pembayaran & Booking', icon: Hotel },
    { id: 'sales-order', label: 'Sales Order', icon: ShoppingCart },
    { id: 'flights', label: 'Monitoring Penerbangan', icon: Plane },
  ];

  const navItems = userRole === 'mitra' 
    ? allNavItems.filter(item => item.id === 'templates' || item.id === 'flights')
    : allNavItems;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center min-h-[4rem] py-2">
          <div className="flex flex-wrap gap-2 flex-grow justify-center items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
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
      </div>
    </nav>
  );
};

