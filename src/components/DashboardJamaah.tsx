import React, { useState } from 'react';
import { Search, Calendar, MapPin, Star, ArrowRight, ShieldCheck, LayoutDashboard, Package, History } from 'lucide-react';
import { KatalogPaketView } from './KatalogPaketView';
import { RiwayatPemesananView } from './RiwayatPemesananView';

type JamaahTab = 'overview' | 'katalog' | 'riwayat';

export const DashboardJamaah = () => {
  const [activeTab, setActiveTab] = useState<JamaahTab>('overview');

  const renderOverview = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Search Section */}
      <div className="bg-emerald-700 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1565552643983-61629090f4fa?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Temukan Perjalanan Spiritual Anda</h1>
          <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
            Pilih paket umroh terbaik dari berbagai pilihan terpercaya dengan harga transparan dan fasilitas terjamin.
          </p>
          
          <button 
            onClick={() => setActiveTab('katalog')}
            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-bold transition-colors inline-flex items-center justify-center gap-2 shadow-lg"
          >
            <Search className="w-5 h-5" />
            Lihat Katalog Paket
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Pasti Berangkat</h3>
              <p className="text-sm text-gray-500">Jadwal dan maskapai terjamin sesuai dengan itinerary.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Fasilitas Terbaik</h3>
              <p className="text-sm text-gray-500">Hotel dekat masjid dan pelayanan muthawwif berpengalaman.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Pembayaran Fleksibel</h3>
              <p className="text-sm text-gray-500">Tersedia berbagai metode pembayaran dan cicilan.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Sub-navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 print:hidden shadow-sm sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto md:overflow-x-visible md:flex-wrap no-scrollbar gap-2 pb-1 -mb-1 md:justify-center">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'overview' 
                  ? 'bg-emerald-100 text-emerald-800 shadow-sm ring-1 ring-emerald-600/20' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
              }`}
            >
              <LayoutDashboard className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'overview' ? 'text-emerald-700' : 'text-gray-500'}`} />
              Beranda
            </button>
            <button
              onClick={() => setActiveTab('katalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'katalog' 
                  ? 'bg-amber-100 text-amber-800 shadow-sm ring-1 ring-amber-600/20' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
              }`}
            >
              <Package className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'katalog' ? 'text-amber-700' : 'text-gray-500'}`} />
              Katalog Paket
            </button>
            <button
              onClick={() => setActiveTab('riwayat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'riwayat' 
                  ? 'bg-blue-100 text-blue-800 shadow-sm ring-1 ring-blue-600/20' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
              }`}
            >
              <History className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'riwayat' ? 'text-blue-700' : 'text-gray-500'}`} />
              Riwayat Pemesanan
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'katalog' && (
          <div className="p-6 max-w-7xl mx-auto w-full">
            <KatalogPaketView />
          </div>
        )}
        {activeTab === 'riwayat' && (
          <div className="p-6 max-w-7xl mx-auto w-full">
            <RiwayatPemesananView />
          </div>
        )}
      </div>
    </div>
  );
};
