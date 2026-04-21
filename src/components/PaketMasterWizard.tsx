import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, ArrowLeft, Check, Search, Building2, MapPin, Star, Calendar, Minus, Plus, User, Smartphone, FileText, Bus, Shield, BookOpen, Home, Map, Train, Users, UserCheck, Receipt, Download, Sparkles, Layers, ImagePlus, Lock, Globe, ArrowRightLeft, MessageCircle, Plane, PlaneTakeoff, ListCheck, ArrowRight, X, Briefcase, ShoppingBag, Shirt } from 'lucide-react';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc, onSnapshot, writeBatch, setDoc } from 'firebase/firestore';

interface PaketMasterWizardProps {
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

const KATEGORI_PROGRAM = ['UMRAH REGULAR', 'UMRAH PLUS', 'UMRAH LA', 'WISATA HALAL'];

const getSteps = (kategori: string) => {
  if (kategori === 'WISATA HALAL') {
    return [
      'INFORMASI DASAR',
      'PILIH PAKET WISATA',
      'DETAIL INFO',
      'LAYANAN TAMBAHAN',
      'REVIEW FASILITAS',
      'RINGKASAN HARGA',
      'VALIDASI AKHIR'
    ];
  }
  if (kategori === 'UMRAH PLUS') {
    return [
      'INFORMASI DASAR',
      'MASKAPAI',
      'HOTEL WISATA',
      'HOTEL UMRAH',
      'LAYANAN',
      'HARGA & REVIEW',
      'REVIEW FASILITAS',
      'PUBLIKASI & DESKRIPSI',
      'VALIDASI AKHIR'
    ];
  }
  if (kategori === 'UMRAH LA') {
    return [
      'INFORMASI DASAR',
      'INFO LAND ARRANGEMENT',
      'HOTEL',
      'LAYANAN',
      'HARGA & REVIEW',
      'REVIEW FASILITAS',
      'PUBLIKASI & DESKRIPSI',
      'VALIDASI AKHIR'
    ];
  }
  return [
    'INFORMASI DASAR',
    'MASKAPAI',
    'HOTEL',
    'LAYANAN',
    'HARGA & REVIEW',
    'REVIEW FASILITAS',
    'PUBLIKASI & DESKRIPSI',
    'VALIDASI AKHIR'
  ];
};

const WISATA_OPTIONS = [
  { category: 'MAKKAH', items: ['City Tour Makkah', 'Jabal Nur', 'Jabal Tsur', 'Museum Makkah'] },
  { category: 'MADINAH', items: ['City Tour Madinah', 'Jabal Uhud', 'Masjid Quba', 'Kebun Kurma', 'Percetakan Al-Quran'] }
];

const DESTINASI_WISATA = [
  { id: 'TURKEY', name: 'TURKEY', available: 4, img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'JAPAN', name: 'JAPAN', available: 2, img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'EUROPE', name: 'EUROPE', available: 1, img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'KOREA', name: 'KOREA', available: 0, img: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'UZBEKISTAN', name: 'UZBEKISTAN', available: 0, img: 'https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'AQSA', name: 'AQSA / JORDAN', available: 0, img: 'https://images.unsplash.com/photo-1585255474641-fc8789500078?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
];

const DUMMY_PAKET_WISATA: Record<string, any[]> = {
  'TURKEY': [
    { id: 't1', name: 'TURKEY 10D9N', rute: 'ISTANBUL - BURSA - CAPPADOCIA', img: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', price: 840 },
    { id: 't2', name: 'TURKEY 12D11N', rute: 'ISTANBUL - BURSA - CAPPADOCIA', img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', price: 920 },
    { id: 't3', name: 'TURKEY 8D7N', rute: 'ISTANBUL - BURSA - ANKARA', img: 'https://images.unsplash.com/photo-1506459312158-1c469f697dbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', price: 750 },
    { id: 't4', name: 'TURKEY 14D13N', rute: 'ISTANBUL - BURSA - CAPPADOCIA', img: 'https://images.unsplash.com/photo-1533140920038-7fba022f778d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', price: 1100 },
  ],
  'JAPAN': [
    { id: 'j1', name: 'HONSHU EXPLORER 8D7N', rute: 'TOKYO - KYOTO - OSAKA', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', price: 1250 },
    { id: 'j2', name: 'HOKKAIDO WINTER 9D8N', rute: 'SAPPORO - OTARU - HAKODATE', img: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', price: 1400 },
  ],
  'EUROPE': [
    { id: 'e1', name: 'WEST EUROPE 12D11N', rute: 'PARIS - BRUSSELS - AMSTERDAM', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', price: 1650 },
  ]
};

export const PaketMasterWizard: React.FC<PaketMasterWizardProps> = ({ initialData, onCancel, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [hotelStep, setHotelStep] = useState<'madinah' | 'makkah'>('madinah');
  const [maskapaiList, setMaskapaiList] = useState<any[]>([]);
  const [hotelsList, setHotelsList] = useState<any[]>([]);
  const [layananList, setLayananList] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<any>(initialData || {
    kategori: 'UMRAH REGULAR',
    nama: '',
    periode: '',
    durasiHari: 9,
    durasiWisata: 2, // New logic
    negaraWisata: 'TURKEY', // New logic
    alurPerjalanan: 'WISATA TERLEBIH DAHULU', // New logic
    kotaKeberangkatan: '',
    kotaTujuan: '',
    urutanKunjungan: '',
    tglBerangkat: '',
    tglKepulangan: '',
    targetJamaah: 45,
    maskapaiId: '',
    hargaDasar: 0,
    deskripsi: '',
    tipePublikasi: 'B2C (PUBLIC)',
    tipePenjualan: 'INDIVIDUAL',
    photoUtama: null,
    tipePenerbangan: 'DIRECT',
    kelasPenerbangan: 'Ekonomi',
    estimasiHargaMaskapai: 0,
    hotelMadinahId: '', 
    chkInMadinah: '',
    durasiMadinah: 3,
    chkOutMadinah: '',
    hotelMakkahId: '', 
    chkInMakkah: '',
    durasiMakkah: 4,
    chkOutMakkah: '',
    hotelWisataId: '',
    selectedLayanan: [], 
    selectedWisata: [], 
    marginBersih: 1000000, 
    ujrohPartner: 0
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubMaskapai = onSnapshot(collection(db, 'maskapai'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaskapaiList(data);
    });
    
    const unsubHotels = onSnapshot(collection(db, 'master_hotels'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHotelsList(data);
    });

    const unsubLayanan = onSnapshot(collection(db, 'master_layanan'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLayananList(data);
    });

    return () => {
      unsubMaskapai();
      unsubHotels();
      unsubLayanan();
    };
  }, []);

  const currentStepsList = getSteps(formData.kategori);
  const currentStepName = currentStepsList[currentStep - 1] || currentStepsList[0];

  const handleNext = () => {
    if (currentStep < currentStepsList.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        nama: formData.nama || 'Paket Umroh Tanpa Nama',
        deskripsi: formData.deskripsi || '',
        tipePublikasi: formData.tipePublikasi || 'B2C',
        tipePenjualan: formData.tipePenjualan || 'INDIVIDUAL',
        hargaDasar: Number(formData.hargaDasar || 0),
        maskapaiId: formData.maskapaiId || '',
        hotelMadinahId: formData.hotelMadinahId || '',
        hotelMakkahId: formData.hotelMakkahId || '',
        hotelWisataId: formData.hotelWisataId || '',
        selectedLayanan: formData.selectedLayanan || [],
        selectedWisata: formData.selectedWisata || [],
        kuota: Number(formData.targetJamaah || 0),
        sisaKuota: Number(formData.targetJamaah || 0),
        status: 'draft',
        // Additional meta
        kategori: formData.kategori,
        periode: formData.periode,
        durasiHari: formData.durasiHari,
        kotaKeberangkatan: formData.kotaKeberangkatan,
        kotaTujuan: formData.kotaTujuan,
        urutanKunjungan: formData.urutanKunjungan,
        tglBerangkat: formData.tglBerangkat,
        tglKepulangan: formData.tglKepulangan,
        tipePenerbangan: formData.tipePenerbangan,
        kelasPenerbangan: formData.kelasPenerbangan,
        estimasiHargaMaskapai: Number(formData.estimasiHargaMaskapai || 0),
        marginBersih: Number(formData.marginBersih || 0),
        ujrohPartner: Number(formData.ujrohPartner || 0),
        durasiMadinah: Number(formData.durasiMadinah || 3),
        durasiMakkah: Number(formData.durasiMakkah || 4),
        durasiWisata: Number(formData.durasiWisata || 0),
      };

      if (initialData?.id) {
        await updateDoc(doc(db, 'paket_master', initialData.id), dataToSave);
      } else {
        await addDoc(collection(db, 'paket_master'), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
      }
      
      // After success save, use the explicit component property for dashboard return
      onSuccess();
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      {/* Header & Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onCancel}
          className="p-2 bg-gray-50 text-gray-600 hover:text-emerald-600 rounded-full transition-colors font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          {initialData ? 'Edit Paket Master' : 'Buat Paket Program Baru'}
        </h2>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="hidden md:flex justify-between items-center mb-10 overflow-x-auto pb-4 custom-scrollbar">
        {currentStepsList.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isPassed = stepNumber < currentStep;

          return (
            <div key={step} className="flex flex-col items-center relative flex-1 min-w-[90px]">
              {/* Connecting line */}
              {index !== 0 && (
                <div className={`absolute top-5 -left-[50%] w-full h-[2px] -m-px ${
                  isPassed ? 'bg-emerald-500' : 'bg-gray-200'
                }`} />
              )}
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 ${
                isActive 
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-50' 
                  : isPassed
                  ? 'bg-emerald-50 text-emerald-500 ring-2 ring-emerald-200'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {isPassed ? <Check className="w-5 h-5" strokeWidth={3} /> : stepNumber}
              </div>
              <span className={`text-[9px] sm:text-[10px] font-bold mt-3 text-center uppercase tracking-wider ${
                isActive ? 'text-emerald-700' : isPassed ? 'text-emerald-600' : 'text-gray-400'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper Text */}
      <div className="md:hidden flex items-center justify-between mb-8 bg-emerald-50 p-4 rounded-xl">
        <span className="text-emerald-700 font-bold text-sm">Langkah {currentStep} dari {currentStepsList.length}</span>
        <span className="text-emerald-800 font-black text-sm">{currentStepsList[currentStep - 1]}</span>
      </div>

      {/* Forms Area */}
      <div className="min-h-[400px]">
        {currentStepName === 'INFORMASI DASAR' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Kategori Program */}
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">PILIH KATEGORI IBADAH/PERJALANAN</label>
              <div className="flex flex-wrap gap-2">
                {KATEGORI_PROGRAM.map(kat => (
                  <button
                    key={kat}
                    onClick={() => setFormData({...formData, kategori: kat})}
                    className={`flex-1 min-w-[120px] px-5 py-4 rounded-xl text-[10px] sm:text-xs font-bold transition-all border ${
                      formData.kategori === kat 
                        ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-sm' 
                        : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-current opacity-50"></span>
                      </span>
                      {kat}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Area Destinasi Wisata Halal */}
            {formData.kategori === 'WISATA HALAL' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="block text-[10px] sm:text-xs font-bold text-blue-500 mb-4 uppercase tracking-wider">
                  PILIH NEGARA TUJUAN *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DESTINASI_WISATA.map((dest) => {
                    const isSelected = formData.negaraWisata === dest.name;
                    return (
                      <button
                        key={dest.id}
                        onClick={() => setFormData({ ...formData, negaraWisata: dest.name })}
                        className={`relative h-40 rounded-2xl overflow-hidden group text-left border-2 transition-all ${
                          isSelected 
                            ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02] z-10' 
                            : 'border-transparent hover:border-blue-200'
                        }`}
                      >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                          <img 
                            src={dest.img} 
                            alt={dest.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent transition-opacity ${
                            isSelected ? 'opacity-90' : 'opacity-70 group-hover:opacity-80'
                          }`} />
                        </div>
                        
                        {/* Content */}
                        <div className="absolute inset-0 p-4 flex flex-col justify-end">
                          <h4 className="text-white font-black text-lg mb-1 tracking-wide">{dest.name}</h4>
                          <div className="flex items-center gap-1.5 text-gray-300 text-[10px] sm:text-xs font-bold">
                            <span className={`w-1.5 h-1.5 rounded-full ${dest.available > 0 ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                            {dest.available} PAKET YG TERSEDIA
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-sm animate-in zoom-in duration-300">
                            <Check className="w-4 h-4" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {formData.kategori !== 'WISATA HALAL' && (
              <>
                {/* Nama Program Paket */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Nama Program Paket</label>
                  <input
                    type="text"
                    placeholder="Misal: Paket Umrah Plus Turkiye 12 Hari"
                    value={formData.nama}
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-800 font-medium transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Pilih Periode */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">PILIH PERIODE *</label>
                <select
                  value={formData.periode}
                  onChange={(e) => setFormData({...formData, periode: e.target.value})}
                  className="w-full p-4 bg-gray-50/50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 font-bold appearance-none transition-all"
                >
                  <option value="">Awal Tahun 2025</option>
                  <option value="Awal Musim">Awal Musim (Muharram-Safar)</option>
                  <option value="High Season">High Season (Rajab-Ramadhan)</option>
                  <option value="Akhir Musim">Akhir Musim (Syawal-Dzulhijjah)</option>
                </select>
              </div>

              {/* Durasi Program (Umrah Plus Wisata atau Biasa) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {formData.kategori === 'UMRAH PLUS' ? 'DURASI PROGRAM UMRAH PLUS WISATA *' : 'DURASI PROGRAM *'}
                  </label>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase">
                    {formData.durasiHari} HARI
                  </span>
                </div>
                <div className="pt-2 pb-1 relative group">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={formData.durasiHari}
                    onChange={(e) => setFormData({...formData, durasiHari: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-gray-300 mt-2">
                    <span>1 Hari</span>
                    <span>30 Hari</span>
                  </div>
                </div>
              </div>

              {/* === UMRAH PLUS EXCLUSIVE FIELDS === */}
              {formData.kategori === 'UMRAH PLUS' && (
                <>
                  {/* Negara Wisata Tambahan */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">NEGARA WISATA TAMBAHAN *</label>
                    <select
                      value={formData.negaraWisata}
                      onChange={(e) => setFormData({...formData, negaraWisata: e.target.value})}
                      className="w-full p-4 bg-gray-50/50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 font-bold appearance-none transition-all"
                    >
                      <option value="TURKEY">TURKEY</option>
                      <option value="DUBAI">DUBAI</option>
                      <option value="AQSHA">AQSHA</option>
                      <option value="MESIR">MESIR</option>
                      <option value="UZBEKISTAN">UZBEKISTAN</option>
                    </select>
                  </div>

                  {/* Durasi Program Wisata */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">DURASI PROGRAM WISATA *</label>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase">
                        {formData.durasiWisata} HARI
                      </span>
                    </div>
                    <div className="pt-2 pb-1 relative group">
                      <input
                        type="range"
                        min="1"
                        max="15"
                        value={formData.durasiWisata}
                        onChange={(e) => setFormData({...formData, durasiWisata: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[9px] font-bold text-gray-300 mt-2">
                        <span>1 Hari</span>
                        <span>15 Hari</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Kota Keberangkatan */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">KOTA KEBERANGKATAN *</label>
                <select
                  value={formData.kotaKeberangkatan}
                  onChange={(e) => setFormData({...formData, kotaKeberangkatan: e.target.value})}
                  className="w-full p-4 bg-gray-50/50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-bold appearance-none"
                >
                  <option value="JAKARTA">JAKARTA</option>
                  <option value="SURABAYA">SURABAYA</option>
                  <option value="MEDAN">MEDAN</option>
                  <option value="MAKASSAR">MAKASSAR</option>
                </select>
              </div>

              {/* Alur Perjalanan & Urutan Kunjungan */}
              {formData.kategori === 'UMRAH PLUS' ? (
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">ALUR PERJALANAN *</label>
                  <select
                    value={formData.alurPerjalanan}
                    onChange={(e) => setFormData({...formData, alurPerjalanan: e.target.value})}
                    className="w-full p-4 bg-gray-50/50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-bold appearance-none"
                  >
                    <option value="WISATA TERLEBIH DAHULU">WISATA TERLEBIH DAHULU</option>
                    <option value="UMRAH TERLEBIH DAHULU">UMRAH TERLEBIH DAHULU</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">URUTAN KUNJUNGAN KOTA *</label>
                  <select
                    value={formData.urutanKunjungan}
                    onChange={(e) => setFormData({...formData, urutanKunjungan: e.target.value})}
                    className="w-full p-4 bg-gray-50/50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-bold appearance-none"
                  >
                    <option value="">-- Pilih Urutan --</option>
                    <option value="Madinah - Mekkah">Madinah - Mekkah</option>
                    <option value="Mekkah - Madinah">Mekkah - Madinah</option>
                    <option value="Mekkah - Madinah - Thaif">Mekkah - Madinah - Thaif</option>
                  </select>
                </div>
              )}

              {/* Kota Tujuan Utama */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">KOTA TUJUAN UTAMA *</label>
                <div className="w-full p-4 bg-gray-50/50 border border-transparent rounded-xl text-gray-800 font-bold">
                  {formData.kategori === 'UMRAH PLUS' 
                    ? (formData.negaraWisata === 'TURKEY' ? 'ISTANBUL' 
                      : formData.negaraWisata === 'DUBAI' ? 'DUBAI'
                      : formData.negaraWisata === 'MESIR' ? 'CAIRO' : '-')
                    : 'JEDDAH / MADINAH'
                  }
                </div>
              </div>

              {/* Tanggal Berangkat */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">TANGGAL KEBERANGKATAN *</label>
                <input
                  type="date"
                  value={formData.tglBerangkat}
                  onChange={(e) => {
                    const newTglBerangkat = e.target.value;
                    let newTglPulang = formData.tglKepulangan;
                    if(newTglBerangkat) {
                      const dt = new Date(newTglBerangkat);
                      dt.setDate(dt.getDate() + formData.durasiHari);
                      newTglPulang = dt.toISOString().split('T')[0];
                    }
                    setFormData({...formData, tglBerangkat: newTglBerangkat, tglKepulangan: newTglPulang});
                  }}
                  className="w-full p-4 bg-gray-50/50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-bold"
                />
              </div>

              {/* Tanggal Kepulangan (Otomatis) */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">TANGGAL KEPULANGAN (OTOMATIS)</label>
                <div className="w-full p-4 bg-gray-50/30 text-gray-400 font-bold rounded-xl border border-transparent">
                  {formData.tglKepulangan ? new Date(formData.tglKepulangan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'dd/mm/yyyy'}
                </div>
              </div>

              {/* Durasi Umrah (Otomatis) - Only if UMRAH PLUS */}
              {formData.kategori === 'UMRAH PLUS' && (
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">DURASI UMRAH (OTOMATIS)</label>
                  <div className="w-full p-4 bg-gray-50/30 text-gray-400 font-bold rounded-xl border border-transparent flex justify-between items-center">
                    <span>{Math.max(0, formData.durasiHari - formData.durasiWisata)}</span>
                    <span className="text-[10px] tracking-widest uppercase">HARI</span>
                  </div>
                </div>
              )}

              {/* Target Jamaah Max */}
              <div className="md:col-span-2 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">TARGET JAMAAH *</label>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase">
                    {formData.targetJamaah} PAX
                  </span>
                </div>
                <div className="pt-2 pb-1 relative group">
                  <input
                    type="range"
                    min="2"
                    max="90"
                    value={formData.targetJamaah}
                    onChange={(e) => setFormData({...formData, targetJamaah: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-blue-200 mt-2">
                    <span>2 Pax</span>
                    <span>90 Pax</span>
                  </div>
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {currentStepName === 'PILIH PAKET WISATA' && formData.kategori === 'WISATA HALAL' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex justify-between items-center bg-gray-50 p-4 border border-gray-100 rounded-xl">
              <div>
                <h3 className="text-sm font-black text-gray-900 tracking-wider uppercase">PILIH PAKET WISATA</h3>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">MENAMPILKAN PAKET UNTUK {formData.negaraWisata || 'TURKEY'}</p>
              </div>
              <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                {(DUMMY_PAKET_WISATA[formData.negaraWisata || 'TURKEY'] || []).length} PAKET TERSEDIA
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(DUMMY_PAKET_WISATA[formData.negaraWisata || 'TURKEY'] || []).map((paket) => {
                const isSelected = formData.paketWisataId === paket.id;
                return (
                  <button
                    key={paket.id}
                    onClick={() => setFormData({...formData, paketWisataId: paket.id, nama: paket.name, hargaDasar: paket.price})}
                    className={`relative rounded-2xl overflow-hidden group text-left border-2 transition-all flex flex-col bg-white ${
                      isSelected 
                        ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.01]' 
                        : 'border-transparent hover:border-gray-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="h-48 relative overflow-hidden w-full bg-gray-100">
                      <img 
                        src={paket.img} 
                        alt={paket.name} 
                        className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-5 flex flex-col items-center justify-center text-center">
                      <h4 className="font-black text-sm text-gray-900 tracking-wider mb-2">{paket.name}</h4>
                      <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-4">{paket.rute}</div>
                      <div className="text-xs font-black text-emerald-600 tracking-widest uppercase">
                        START $ {paket.price.toFixed(2)}
                      </div>
                    </div>
                  </button>
                );
              })}
              
              {(DUMMY_PAKET_WISATA[formData.negaraWisata || 'TURKEY'] || []).length === 0 && (
                <div className="col-span-1 md:col-span-2 py-20 text-center text-gray-400 font-bold text-xs">
                  Belum ada paket wisata tersedia untuk negara ini
                </div>
              )}
            </div>
          </div>
        )}

        {currentStepName === 'DETAIL INFO' && formData.kategori === 'WISATA HALAL' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
            {/* Header / Rute */}
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-black text-[#1A1C29] tracking-wider uppercase">
                {formData.paketWisataId 
                  ? (DUMMY_PAKET_WISATA[formData.negaraWisata || 'TURKEY']?.find(p => p.id === formData.paketWisataId)?.rute || 'EXPLORE ISTANBUL - BURSA - CAPPADOCIA')
                  : 'EXPLORE ISTANBUL - BURSA - CAPPADOCIA'}
              </h3>
            </div>

            {/* Gallery Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                 <img src="https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Gallery 1" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                 <img src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Gallery 2" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                 <img src="https://images.unsplash.com/photo-1533140920038-7fba022f778d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Gallery 3" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>

            {/* Banner duration and pax */}
            <div className="flex flex-col sm:flex-row bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
               <div className="flex-1 p-4 border-b sm:border-b-0 sm:border-r border-gray-200">
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1">DURATION</p>
                  <p className="text-sm font-black text-gray-900 uppercase">10 HARI 9 MALAM</p>
               </div>
               <div className="flex-1 p-4">
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1">MIN PAX</p>
                  <p className="text-sm font-black text-gray-900 uppercase">5 PAX</p>
               </div>
            </div>

            {/* Pricing Tables */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              {/* FIT Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="flex justify-between items-center bg-[#FFFdf5] p-3 border-b border-[#fbecc8]">
                  <span className="text-[10px] font-black uppercase text-gray-800">FIT</span>
                  <span className="text-[10px] font-black uppercase text-gray-800">PRICE / PAX</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {[2, 4, 7, 8, 9].map(pax => (
                    <div key={`fit-${pax}`} className="flex justify-between items-center p-4">
                      <span className="text-xs font-bold text-gray-700 w-12">{pax}</span>
                      <div className="flex-1 flex justify-center">
                        <div className="w-5 h-5 border-2 border-gray-200 rounded flex items-center justify-center bg-white cursor-pointer hover:border-blue-400">
                          {pax === 8 && <Check className="w-3 h-3 text-blue-500" strokeWidth={3} />}
                        </div>
                      </div>
                      <span className="text-xs font-black text-gray-900 w-28 text-right">Rp 13.850.000</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GROUP Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="flex justify-between items-center bg-[#FFFdf5] p-3 border-b border-[#fbecc8]">
                  <span className="text-[10px] font-black uppercase text-gray-800">GROUP</span>
                  <span className="text-[10px] font-black uppercase text-gray-800">PRICE / PAX</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {['10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-49'].map(range => (
                    <div key={`grp-${range}`} className="flex justify-between items-center p-4">
                      <span className="text-xs font-bold text-gray-700 w-12">{range}</span>
                      <div className="flex-1 flex justify-center">
                        <div className="w-5 h-5 border-2 border-gray-200 rounded flex items-center justify-center bg-white cursor-pointer hover:border-blue-400">
                          {/* Empty checkbox */}
                        </div>
                      </div>
                      <span className="text-xs font-black text-gray-900 w-28 text-right">Rp 14.400.000</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Include & Exclude */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gray-200 rounded-xl overflow-hidden mb-8 bg-white text-xs">
               <div className="border-b lg:border-b-0 lg:border-r border-gray-200">
                  <div className="bg-emerald-50 p-3 border-b border-gray-200 text-[10px] font-black uppercase text-emerald-900 tracking-wider">INCLUDE</div>
                  <ul className="p-5 space-y-4 text-gray-600 font-medium leading-relaxed">
                     <li className="flex items-start gap-3">
                       <Check className="text-emerald-500 w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={3} />
                       <span>Meet and greet service by our English speaking driver.</span>
                     </li>
                     <li className="flex items-start gap-3">
                       <Check className="text-emerald-500 w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={3} />
                       <span>All transfers by air conditioning coach.</span>
                     </li>
                     <li className="flex items-start gap-3">
                       <Check className="text-emerald-500 w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={3} />
                       <span>Accommodation in 4/5* Hotels based on breakfast and dinner.</span>
                     </li>
                     <li className="flex items-start gap-3">
                       <Check className="text-emerald-500 w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={3} />
                       <span>All sightseeing tours as mentioned in the itinerary.</span>
                     </li>
                     <li className="flex items-start gap-3">
                       <Check className="text-emerald-500 w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={3} />
                       <span>Entrance fees to all sites as indicated.</span>
                     </li>
                  </ul>
               </div>
               <div>
                  <div className="bg-red-50 p-3 border-b border-gray-200 text-[10px] font-black uppercase text-red-900 tracking-wider">EXCLUDE</div>
                  <ul className="p-5 space-y-4 text-gray-600 font-medium leading-relaxed">
                     <li className="flex items-start gap-3">
                       <X className="text-red-500 w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={3} />
                       <span>International Airfare</span>
                     </li>
                     <li className="flex items-start gap-3">
                       <X className="text-red-500 w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={3} />
                       <span>Turkey entry Visa</span>
                     </li>
                     <li className="flex items-start gap-3">
                       <X className="text-red-500 w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={3} />
                       <span>Any optional tours, personal expenses</span>
                     </li>
                  </ul>
               </div>
            </div>

            {/* Tentative Itinerary */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-8 bg-white">
              <div className="bg-blue-50 p-3 border-b border-blue-100 text-[10px] font-black uppercase text-blue-900 tracking-wider">TENTATIVE ITINERARY</div>
              <div className="divide-y divide-gray-100">
                {[
                  { day: 1, title: 'ARRIVAL ISTANBUL', desc: 'Meet & Greet, Transfer to hotel' },
                  { day: 2, title: 'ISTANBUL - BURSA', desc: 'Grand Mosque, Green Tomb, Silk Market' },
                  { day: 3, title: 'BURSA - KUSADASI', desc: 'Ephesus Ancient City' },
                  { day: 4, title: 'KUSADASI - PAMUKKALE', desc: 'Hierapolis, Cotton Castle' },
                  { day: 5, title: 'PAMUKKALE - KONYA - CAPPADOCIA', desc: 'Mevlana Museum' },
                  { day: 6, title: 'CAPPADOCIA', desc: 'Underground City, Goreme Valley' },
                  { day: 7, title: 'CAPPADOCIA - ANKARA - ISTANBUL', desc: 'Salt Lake, Ataturk Mausoleum' },
                  { day: 8, title: 'ISTANBUL CITY TOUR', desc: 'Hagia Sophia, Blue Mosque, Topkapi Palace' },
                ].map((item) => (
                   <div key={item.day} className="p-4 sm:p-5">
                     <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                       <MapPin className="w-3 h-3" /> DAY {item.day}
                     </p>
                     <p className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wide">{item.title}</p>
                     <p className="text-[10px] sm:text-xs text-gray-500 mt-1 font-medium">{item.desc}</p>
                   </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {currentStepName === 'LAYANAN TAMBAHAN' && formData.kategori === 'WISATA HALAL' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
            {/* Header */}
            <div className="text-center mb-10">
              <h3 className="text-lg sm:text-xl font-black text-[#1A1C29] tracking-wider uppercase mb-1">
                ADDITIONAL & ADD ON
              </h3>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                PILIH LAYANAN TAMBAHAN DAN PERLENGKAPAN PAX
              </p>
            </div>

            {/* Essential Services */}
            <div className="space-y-4">
               {/* Tour Leader */}
               <div className={`border-2 rounded-[1.25rem] overflow-hidden transition-all duration-200 ${formData.wisataAddon_tourLeader ? 'border-blue-500 bg-white ring-4 ring-blue-500/10' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div 
                    className="p-5 flex items-center cursor-pointer"
                    onClick={() => setFormData({...formData, wisataAddon_tourLeader: !formData.wisataAddon_tourLeader})}
                  >
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-5 transition-colors ${formData.wisataAddon_tourLeader ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <UserCheck className="w-6 h-6" />
                     </div>
                     <div className="flex-1">
                        <h4 className="font-black text-xs text-[#1A1C29] uppercase tracking-wider mb-1">TOUR LEADER</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">PENDAMPING DARI TANAH AIR</p>
                        <p className="text-[10px] font-black text-blue-600">Rp 250.000</p>
                     </div>
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${formData.wisataAddon_tourLeader ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 bg-transparent'}`}>
                        {formData.wisataAddon_tourLeader && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                     </div>
                  </div>
                  
                  {/* EXPANDED CONTENT */}
                  {formData.wisataAddon_tourLeader && (
                    <div className="p-5 pt-0">
                       <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">JUMLAH TOUR LEADER (PAX):</label>
                          <input 
                            type="number" 
                            min="1"
                            className="w-full border border-gray-200 rounded-lg p-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={formData.wisataAddon_tourLeaderCount || 1}
                            onChange={(e) => setFormData({...formData, wisataAddon_tourLeaderCount: e.target.value})}
                          />
                       </div>
                    </div>
                  )}
               </div>

               {/* Handling Domestik */}
               <div className={`border-2 rounded-[1.25rem] overflow-hidden transition-all duration-200 ${formData.wisataAddon_handling ? 'border-blue-500 bg-white ring-4 ring-blue-500/10' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div 
                    className="p-5 flex items-center cursor-pointer"
                    onClick={() => setFormData({...formData, wisataAddon_handling: !formData.wisataAddon_handling})}
                  >
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-5 transition-colors ${formData.wisataAddon_handling ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <Shield className="w-6 h-6" />
                     </div>
                     <div className="flex-1">
                        <h4 className="font-black text-xs text-[#1A1C29] uppercase tracking-wider mb-1">HANDLING DOMESTIK</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">LAYANAN BANDARA KEBERANGKATAN</p>
                        <p className="text-[10px] font-black text-blue-600">Rp 250.000</p>
                     </div>
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${formData.wisataAddon_handling ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 bg-transparent'}`}>
                        {formData.wisataAddon_handling && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                     </div>
                  </div>
                  
                  {/* EXPANDED CONTENT */}
                  {formData.wisataAddon_handling && (
                    <div className="p-5 pt-0">
                       <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">TIPE HANDLING:</label>
                          <select 
                            className="w-full bg-[#E5F3FF] border border-blue-100 rounded-lg p-2.5 text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                            value={formData.wisataAddon_handlingType || 'Handling domestik + Lounge'}
                            onChange={(e) => setFormData({...formData, wisataAddon_handlingType: e.target.value})}
                          >
                            <option>Handling domestik + Lounge</option>
                            <option>Handling domestik Only</option>
                            <option>Lounge Only</option>
                          </select>
                       </div>
                    </div>
                  )}
               </div>

               {/* Travel Kits */}
               <div className={`border-2 rounded-[1.25rem] overflow-hidden transition-all duration-200 ${formData.wisataAddon_travelKits ? 'border-blue-500 bg-white ring-4 ring-blue-500/10' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div 
                    className="p-5 flex items-center cursor-pointer"
                    onClick={() => setFormData({...formData, wisataAddon_travelKits: !formData.wisataAddon_travelKits})}
                  >
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-5 transition-colors ${formData.wisataAddon_travelKits ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <Briefcase className="w-6 h-6" />
                     </div>
                     <div className="flex-1">
                        <h4 className="font-black text-xs text-[#1A1C29] uppercase tracking-wider mb-1">TRAVEL KITS</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">NAMETAG & TAS KECIL</p>
                        <p className="text-[10px] font-black text-blue-600">Rp 250.000</p>
                     </div>
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${formData.wisataAddon_travelKits ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 bg-transparent'}`}>
                        {formData.wisataAddon_travelKits && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                     </div>
                  </div>
               </div>
            </div>

            {/* Merchandise Divider */}
            <div className="pt-8 mb-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">MERCHANDISE & ADD ONS</h4>
              
              <div className="grid grid-cols-1 gap-3">
                 {[
                   {id: 'koper', name: 'KOPER CUSTOM', desc: 'KOPER DENGAN DESAIN KHUSUS', price: 1500000, icon: Briefcase},
                   {id: 'slingbag', name: 'SLING BAG', desc: 'TAS SELEMPANG EKSKLUSIF', price: 50000, icon: ShoppingBag},
                   {id: 'kaos', name: 'KAOS GRUP', desc: 'KAOS SERAGAM ROMBONGAN', price: 150000, icon: Shirt},
                   {id: 'jaket', name: 'JACKET GRUP', desc: 'JAKET SERAGAM ROMBONGAN', price: 250000, icon: Shirt},
                   {id: 'tasserut', name: 'TAS SERUT', desc: 'TAS SERUT PRAKTIS', price: 25000, icon: ShoppingBag},
                   {id: 'topi', name: 'TOPI', desc: 'TOPI IDENTITAS GRUP', price: 35000, icon: User},
                   {id: 'spanduk', name: 'SPANDUK ROMBONGAN', desc: 'SPANDUK UNTUK FOTO BERSAMA', price: 150000, icon: FileText},
                 ].map(item => {
                    const isSelected = formData[`wisataAddon_merch_${item.id}`];
                    const Icon = item.icon;
                    return (
                       <div 
                         key={item.id}
                         className={`border rounded-[1rem] overflow-hidden transition-all duration-200 bg-white ${isSelected ? 'border-blue-200 ring-2 ring-blue-500/10 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                       >
                          <div 
                            className="p-4 flex items-center cursor-pointer"
                            onClick={() => setFormData({...formData, [`wisataAddon_merch_${item.id}`]: !isSelected})}
                          >
                             <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 transition-colors ${isSelected ? 'bg-gray-50 text-gray-400' : 'bg-gray-50 text-gray-300'}`}>
                                <Icon className="w-5 h-5" /> 
                             </div>
                             <div className="flex-1">
                                <h4 className="font-black text-[11px] text-[#1A1C29] uppercase tracking-wider mb-0.5">{item.name}</h4>
                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">{item.desc}</p>
                                <p className="text-[10px] font-black text-gray-900">Rp {item.price.toLocaleString('id-ID')}</p>
                             </div>
                             <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${isSelected ? 'border-transparent bg-transparent text-blue-500' : 'border-gray-200 bg-transparent text-transparent'}`}>
                                {isSelected ? <Check className="w-4 h-4" strokeWidth={4} /> : <div className="w-full h-full rounded-full" />}
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>
            </div>

          </div>
        )}

        {currentStepName === 'REVIEW FASILITAS' && formData.kategori === 'WISATA HALAL' && (() => {
          const baseIDR = (formData.hargaDasar || 1350) * 16000;
          let addonsTotal = 0;
          if (formData.wisataAddon_tourLeader) addonsTotal += 250000 * (Number(formData.wisataAddon_tourLeaderCount) || 1);
          if (formData.wisataAddon_handling) addonsTotal += 250000;
          if (formData.wisataAddon_travelKits) addonsTotal += 250000;
          if (formData.wisataAddon_merch_koper) addonsTotal += 1500000;
          if (formData.wisataAddon_merch_slingbag) addonsTotal += 50000;
          if (formData.wisataAddon_merch_kaos) addonsTotal += 150000;
          if (formData.wisataAddon_merch_jaket) addonsTotal += 250000;
          if (formData.wisataAddon_merch_tasserut) addonsTotal += 25000;
          if (formData.wisataAddon_merch_topi) addonsTotal += 35000;
          if (formData.wisataAddon_merch_spanduk) addonsTotal += 150000;
          
          const hppTotal = baseIDR + addonsTotal;
          const currentMargin = formData.wisataMargin !== undefined ? formData.wisataMargin : 100000;
          const adminFee = currentMargin * 0.1;
          const totalMarkup = currentMargin + adminFee;
          const finalPrice = hppTotal + totalMarkup;

          return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
              {/* 1. HPP DASAR PAKET */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-gray-900 rounded-full"></div>
                  <h4 className="font-black text-sm text-[#1A1C29] uppercase tracking-wider">1. HPP DASAR PAKET</h4>
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-3 mb-4">BIAYA POKOK (HARGA BASE + ADDITIONAL & ADD ONS)</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl p-5">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">HPP TOTAL / PAX</p>
                    <h3 className="font-black text-xl italic text-[#1A1C29]">Rp {hppTotal.toLocaleString('id-ID')}</h3>
                  </div>
                  <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl p-5">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">DURASI PROGRAM</p>
                    <h3 className="font-black text-xl italic text-[#1A1C29]">10D9N</h3>
                  </div>
                </div>
              </div>
              
              {/* 2. PENGATURAN PROFIT */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                  <h4 className="font-black text-sm text-[#1A1C29] uppercase tracking-wider">2. PENGATURAN PROFIT (UJROH MITRA)</h4>
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-3 mb-4">TENTUKAN MARGIN KEUNTUNGAN PER PAX (10.000 - 1.000.000)</p>
                
                <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col items-center">
                  {/* Kontrol Margin */}
                  <div className="bg-gray-50 rounded-full p-2 flex items-center justify-between gap-4 sm:gap-8 min-w-[280px] sm:min-w-[320px] mb-8">
                    <button 
                      onClick={() => setFormData({...formData, wisataMargin: Math.max(0, currentMargin - 50000)})}
                      className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer z-10"
                    >
                      <Minus className="w-5 h-5 pointer-events-none" />
                    </button>
                    
                    <div className="text-center flex-1">
                      <h3 className="font-black text-2xl sm:text-3xl text-blue-600 tracking-tight italic">Rp {currentMargin.toLocaleString('id-ID')}</h3>
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-1">MARGIN</p>
                    </div>
                    
                    <button 
                      onClick={() => setFormData({...formData, wisataMargin: currentMargin + 50000})}
                      className="w-12 h-12 rounded-full bg-blue-600 shadow-lg shadow-blue-500/40 flex items-center justify-center text-white hover:bg-blue-700 transition-colors cursor-pointer z-10"
                    >
                      <Plus className="w-5 h-5 pointer-events-none" />
                    </button>
                  </div>
                  
                  {/* Breakdown Card */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <div className="flex-1 bg-gray-50 border border-gray-100 p-4 rounded-2xl relative overflow-hidden">
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5 flex justify-between">ADMIN FEE (10%) <ArrowRightLeft className="w-3 h-3" /></p>
                      <h4 className="font-black text-sm text-gray-900 italic">Rp {adminFee.toLocaleString('id-ID')}</h4>
                    </div>
                    <div className="flex-1 bg-blue-50 border border-blue-100 p-4 rounded-2xl relative overflow-hidden">
                      <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1.5 flex justify-between">TOTAL MARKUP <ArrowRight className="w-3 h-3" /></p>
                      <h4 className="font-black text-sm text-blue-700 italic">Rp {totalMarkup.toLocaleString('id-ID')}</h4>
                    </div>
                  </div>
                  
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-6 text-center">BIAYA ADMIN DISEDIAKAN UNTUK PENGELOLAAN INDUSTRI SISTEM</p>
                </div>
              </div>
              
              {/* 3. HARGA JUAL MARKETPLACE (FINAL) */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-[#009B66] rounded-full"></div>
                  <h4 className="font-black text-sm text-[#1A1C29] uppercase tracking-wider">3. HARGA JUAL MARKETPLACE (FINAL)</h4>
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-3 mb-4">HARGA AKHIR PER PAX YANG AKAN TAYANG DI APLIKASI JAMAAH</p>
                
                <div className="bg-[#131620] rounded-[2rem] p-8 sm:p-12 relative overflow-hidden text-center flex flex-col items-center justify-center shadow-2xl">
                  {/* Decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                  
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 mb-6 z-10">
                    <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-teal-400" strokeWidth={3} /> WISATA HALAL PACKAGE
                    </span>
                  </div>
                  
                  <h1 className="font-black text-4xl sm:text-5xl text-white tracking-tight italic mb-3 z-10">
                    <span className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 mr-2">Rp</span>
                    {finalPrice.toLocaleString('id-ID')}
                  </h1>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest z-10">ALL-IN / PER PAX</p>
                </div>
              </div>

            </div>
          );
        })()}

        {(currentStepName === 'MASKAPAI' || currentStepName === 'INFO LAND ARRANGEMENT') && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {formData.kategori === 'UMRAH LA' ? (
              <div className="bg-[#FFFDF5] border border-[#FBECC8] rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-inner">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-[#FEEAC1] flex items-center justify-center mb-6">
                  <PlaneTakeoff className="w-10 h-10 text-[#F59E0B]" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-black text-[#1A1C29] tracking-wider mb-3">KATEGORI LAND ARRANGEMENT</h3>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest max-w-md leading-relaxed">
                  TIKET PESAWAT TIDAK TERMASUK DALAM PAKET INI.<br/>
                  MITRA HANYA MENYEDIAKAN AKOMODASI DI SAUDI.
                </p>
              </div>
            ) : (
              <>
                {/* Tipe Penerbangan */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Tipe Penerbangan</label>
                  <div className="flex border border-gray-200 rounded-xl overflow-hidden p-1 bg-gray-50 max-w-2xl">
                    {['DIRECT', 'TRANSIT'].map(type => (
                      <button
                        key={type}
                        onClick={() => setFormData({...formData, tipePenerbangan: type})}
                        className={`flex-1 py-3 text-sm font-bold transition-all rounded-lg ${
                          formData.tipePenerbangan === type 
                            ? 'bg-white text-emerald-600 border border-emerald-100 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Pilih Maskapai */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Pilih Maskapai</label>
                    <select
                      value={formData.maskapaiId}
                      onChange={(e) => setFormData({...formData, maskapaiId: e.target.value})}
                      className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 font-medium appearance-none bg-white"
                    >
                      <option value="">-- Pilih Maskapai --</option>
                      {maskapaiList.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.tanggalKeberangkatan}) - Sisa: {m.availableSeats}</option>
                      ))}
                    </select>
                  </div>

                  {/* Kelas Penerbangan */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Kelas Penerbangan</label>
                    <select
                      value={formData.kelasPenerbangan}
                      onChange={(e) => setFormData({...formData, kelasPenerbangan: e.target.value})}
                      className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 font-medium appearance-none bg-white"
                    >
                      <option value="Ekonomi">Ekonomi</option>
                      <option value="Bisnis">Bisnis</option>
                      <option value="First Class">First Class</option>
                    </select>
                  </div>
                </div>

                {/* Estimasi Harga Maskapai */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Estimasi Harga Maskapai (Per pax)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.estimasiHargaMaskapai || ''}
                      onChange={(e) => setFormData({...formData, estimasiHargaMaskapai: e.target.value})}
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 font-bold transition-all"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {currentStepName === 'HOTEL WISATA' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 relative pb-20">
            {/* Banner Header Dinamis */}
            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-blue-900 text-lg uppercase tracking-wide">PAKET WISATA {formData.negaraWisata || 'TURKEY'}</h3>
                <p className="text-xs font-bold text-blue-600 uppercase mt-1">DURASI PROGRAM: {formData.durasiWisata || 0} HARI</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
            </div>

            <div className="mt-8 mb-4">
              <label className="block text-[10px] sm:text-xs font-bold text-gray-900 uppercase tracking-wider">PILIH HOTEL WISATA</label>
            </div>

            {/* Hotel Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {hotelsList.filter(h => h.kota?.toLowerCase() !== 'madinah' && h.kota?.toLowerCase() !== 'makkah').map(hotel => {
                const isSelected = formData.hotelWisataId === hotel.id;
                return (
                  <div 
                    key={hotel.id} 
                    onClick={() => setFormData({...formData, hotelWisataId: hotel.id})}
                    className={`bg-white rounded-2xl overflow-hidden border-2 cursor-pointer transition-all flex flex-col ${isSelected ? 'border-blue-500 shadow-[0_8px_30px_rgba(59,130,246,0.15)] ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <div className="h-44 overflow-hidden relative bg-gray-100 flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-gray-300" />
                      
                      <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-gray-900 drop-shadow-md font-black uppercase text-sm mb-1">{hotel.nama}</h4>
                        <div className="flex items-center gap-1">
                           {[...Array(hotel.bintang || 5)].map((_, i) => (
                             <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                           ))}
                        </div>
                      </div>
                      {isSelected && (
                         <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                           <Check className="w-3.5 h-3.5 text-white" />
                         </div>
                      )}
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-end mb-4 border-b border-gray-100 pb-4">
                        <div>
                          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">HARGA PAKET WISATA</div>
                          <div className="text-blue-700 font-black text-xl">Rp {((hotel.priceQuad || hotel.pricePerNight || 0) * formData.durasiWisata).toLocaleString('id-ID')}</div>
                        </div>
                        <div className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[9px] font-bold">
                          1 PAX
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">HARI / MALAM</span>
                          <span className="text-[10px] text-gray-900 font-bold">Rp {(hotel.priceQuad || hotel.pricePerNight || 0).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">DURASI ({formData.durasiWisata} MALAM)</span>
                          <span className="text-[10px] text-gray-900 font-bold">Rp {((hotel.priceQuad || hotel.pricePerNight || 0) * formData.durasiWisata).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Preview Itinerary Wisata */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
               <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-6">PREVIEW ITINERARY WISATA</h4>
               <div className="space-y-0 text-sm">
                 {[...Array(Math.max(1, formData.durasiWisata))].map((_, idx) => (
                   <div key={idx} className="flex relative">
                     {/* Line connector */}
                     {(idx < formData.durasiWisata - 1) && (
                       <div className="absolute left-[7px] top-6 bottom-0 w-[1px] bg-gray-300"></div>
                     )}
                     
                     {/* Circle marker */}
                     <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-white z-10 shrink-0 mt-1 mr-4"></div>
                     
                     <div className="pb-8">
                       <h5 className="font-bold text-gray-800 text-[11px] tracking-wider uppercase mb-1">HARI KE-{idx + 1}: CITY TOUR {formData.negaraWisata || 'TURKEY'}</h5>
                       <p className="text-[10px] text-gray-500 leading-relaxed max-w-2xl">
                         Mengunjungi destinasi populer dan tempat bersejarah di {formData.negaraWisata || 'Turkey'}. Termasuk makan siang dan makan malam di restoran halal lokal.
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

          </div>
        )}

        {(currentStepName === 'HOTEL' || currentStepName === 'HOTEL UMRAH') && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Header sub-step */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
                <h3 className="font-bold text-gray-700 uppercase tracking-wide text-xs sm:text-sm">
                  Pilih Hotel DI {hotelStep === 'madinah' ? 'Madinah (Langkah 3.1)' : 'Makkah (Langkah 3.2)'}
                </h3>
              </div>
              <div className="flex bg-gray-100 rounded-full p-1 gap-1">
                <button 
                  onClick={() => setHotelStep('madinah')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${hotelStep === 'madinah' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {hotelStep === 'madinah' && <span className="mr-1">3.1</span>}
                  MADINAH
                </button>
                <button 
                  onClick={() => setHotelStep('makkah')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${hotelStep === 'makkah' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {hotelStep === 'makkah' && <span className="mr-1">3.2</span>}
                  MAKKAH
                </button>
              </div>
            </div>

            {/* Dark Blue Date Box */}
            <div className="bg-[#1e2336] rounded-xl p-4 flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 font-bold mb-1 block uppercase">Check In</label>
                <input 
                  type="date" 
                  value={hotelStep === 'madinah' ? formData.chkInMadinah : formData.chkInMakkah}
                  onChange={(e) => {
                    const val = e.target.value;
                    if(hotelStep === 'madinah') setFormData({...formData, chkInMadinah: val});
                    else setFormData({...formData, chkInMakkah: val});
                  }}
                  className="w-full bg-[#151928] text-gray-300 px-3 py-2 rounded-lg border border-gray-700 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 font-bold mb-1 block uppercase">Durasi Malam</label>
                <div className="flex items-center bg-[#151928] rounded-lg border border-gray-700 py-1.5 px-1">
                  <button 
                    onClick={() => {
                      if(hotelStep === 'madinah' && formData.durasiMadinah > 1) setFormData({...formData, durasiMadinah: formData.durasiMadinah - 1});
                      if(hotelStep === 'makkah' && formData.durasiMakkah > 1) setFormData({...formData, durasiMakkah: formData.durasiMakkah - 1});
                    }}
                    className="px-3 text-gray-400 hover:text-white"><Minus className="w-4 h-4"/></button>
                  <input 
                    type="text" 
                    value={hotelStep === 'madinah' ? formData.durasiMadinah : formData.durasiMakkah} 
                    className="w-full bg-transparent text-center text-white font-bold text-sm outline-none" 
                    readOnly
                  />
                  <button 
                    onClick={() => {
                      if(hotelStep === 'madinah') setFormData({...formData, durasiMadinah: formData.durasiMadinah + 1});
                      if(hotelStep === 'makkah') setFormData({...formData, durasiMakkah: formData.durasiMakkah + 1});
                    }}
                    className="px-3 text-gray-400 hover:text-white"><Plus className="w-4 h-4"/></button>
                </div>
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 font-bold mb-1 block uppercase">Check Out</label>
                <input 
                  type="date" 
                  value={hotelStep === 'madinah' ? formData.chkOutMadinah : formData.chkOutMakkah}
                  onChange={(e) => {
                    const val = e.target.value;
                    if(hotelStep === 'madinah') setFormData({...formData, chkOutMadinah: val});
                    else setFormData({...formData, chkOutMakkah: val});
                  }}
                  className="w-full bg-[#151928] text-gray-300 px-3 py-2 rounded-lg border border-gray-700 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex-1 flex items-end">
                <div className="w-full bg-[#0d4a3e] border border-[#166554] text-white rounded-lg p-2 flex flex-col items-center justify-center min-h-[42px]">
                  <span className="text-[10px] font-bold text-emerald-200">PERJALANAN HARI</span>
                  <span className="text-sm font-black text-white flex items-center gap-1">
                    <User className="w-3 h-3"/> {hotelStep === 'madinah' ? formData.durasiMadinah : formData.durasiMakkah} Malam
                  </span>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-4">
              <div className="relative mb-3">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input 
                  type="text" 
                  placeholder="Cari nama hotel..." 
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 outline-none appearance-none">
                  <option>Harga Terendah</option>
                </select>
                <select className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 outline-none appearance-none">
                  <option>Semua Bintang</option>
                </select>
                <select className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 outline-none appearance-none">
                  <option>Semua Jarak</option>
                </select>
              </div>
            </div>

            {/* Hotel Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {hotelsList.filter(h => h.kota?.toLowerCase() === hotelStep).map(hotel => {
                const isSelected = hotelStep === 'madinah' ? formData.hotelMadinahId === hotel.id : formData.hotelMakkahId === hotel.id;
                return (
                  <div 
                    key={hotel.id} 
                    onClick={() => {
                        if(hotelStep === 'madinah') setFormData({...formData, hotelMadinahId: hotel.id});
                        else setFormData({...formData, hotelMakkahId: hotel.id});
                    }}
                    className={`bg-[#0b101e] rounded-2xl overflow-hidden border cursor-pointer transition-all flex flex-col ${isSelected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-gray-800 hover:border-gray-600'}`}
                  >
                    <div className="h-40 overflow-hidden relative bg-gray-800 flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-gray-700" />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h4 className="text-white font-black uppercase text-sm mb-1">{hotel.nama}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4">{hotel.kota}</p>
                      
                      <div className="flex gap-2 mb-6">
                        <span className="bg-[#1e2336] text-amber-500 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-amber-500"/> {hotel.bintang || 5}</span>
                      </div>
                      
                      <div className="mt-auto flex justify-between items-end">
                        <div>
                          <div className="text-emerald-400 font-black text-lg">Rp {(hotel.priceQuad || 0).toLocaleString('id-ID')} <span className="text-[10px] text-gray-500 font-bold">/ MALAM</span></div>
                          <div className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">QUAD / PAX</div>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-600'}`}>
                          {isSelected && <Check className="w-4 h-4"/>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Box */}
            <div className="bg-[#07593c] rounded-2xl p-5 md:p-6 relative overflow-hidden mt-8">
              <Building2 className="absolute -right-6 -bottom-6 w-40 h-40 text-emerald-900/40 z-0" />
              
              <div className="flex items-center gap-2 mb-6 relative z-10">
                <Building2 className="w-5 h-5 text-emerald-300" />
                <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-wider">RINGKASAN ESTIMASI HARGA JUAL KOMPONEN HOTEL PER PAX</h3>
              </div>

              <div className="space-y-4 relative z-10">
                {['madinah', 'makkah'].map((citySpan) => {
                  const hId = citySpan === 'madinah' ? formData.hotelMadinahId : formData.hotelMakkahId;
                  const durasi = citySpan === 'madinah' ? formData.durasiMadinah : formData.durasiMakkah;
                  const hObj = hotelsList.find(h => h.id === hId);
                  
                  if (!hObj) return null;
                  
                  return (
                    <div key={citySpan} className="border border-[#116e4d] bg-[#0c6344] rounded-xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-emerald-100 text-[10px] font-bold uppercase tracking-wider">HOTEL {citySpan.toUpperCase()}: {hObj.nama}</span>
                        <span className="text-emerald-100 text-[10px] font-bold bg-[#116e4d] px-2 py-1 rounded-md">{durasi} MALAM</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-[#167855] rounded-lg p-2.5 text-center border border-[#1e8c65]">
                          <div className="text-emerald-200 text-[9px] font-bold uppercase mb-1 tracking-wider">QUAD</div>
                          <div className="text-white font-black text-sm">Rp {((hObj.priceQuad || 0) * durasi).toLocaleString('id-ID')}</div>
                        </div>
                        <div className="bg-[#167855] rounded-lg p-2.5 text-center border border-[#1e8c65]">
                          <div className="text-emerald-200 text-[9px] font-bold uppercase mb-1 tracking-wider">TRIPLE</div>
                          <div className="text-white font-black text-sm">Rp {((hObj.priceTriple || 0) * durasi).toLocaleString('id-ID')}</div>
                        </div>
                        <div className="bg-[#167855] rounded-lg p-2.5 text-center border border-[#1e8c65]">
                          <div className="text-emerald-200 text-[9px] font-bold uppercase mb-1 tracking-wider">DOUBLE</div>
                          <div className="text-white font-black text-sm">Rp {((hObj.priceDouble || 0) * durasi).toLocaleString('id-ID')}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#116e4d] mt-6 pt-5 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-2 relative z-10">
                <div>
                  <div className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">TOTAL ESTIMASI KOMPONEN HOTEL (QUAD)</div>
                  <div className="text-white font-black text-2xl flex items-baseline gap-1">
                    {(() => {
                      const hMadinah = hotelsList.find(h => h.id === formData.hotelMadinahId);
                      const hMakkah = hotelsList.find(h => h.id === formData.hotelMakkahId);
                      const sum = ((hMadinah?.priceQuad || 0) * formData.durasiMadinah) + ((hMakkah?.priceQuad || 0) * formData.durasiMakkah);
                      return `Rp ${sum.toLocaleString('id-ID')}`;
                    })()}
                    <span className="text-xs font-bold text-emerald-200">/ PAX</span>
                  </div>
                </div>
                <div className="text-[9px] font-bold text-emerald-300 italic opacity-80">
                  *Harga sudah termasuk durasi menginap di kedua kota
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Step 4: Layanan */}
        {currentStepName === 'LAYANAN' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 relative pb-40">
            {/* Header sub-step */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
              <h3 className="font-bold text-gray-700 uppercase tracking-wide text-xs sm:text-sm">
                KONFIGURASI LAYANAN & OPERASIONAL (LANGKAH 4)
              </h3>
            </div>

            <div className="space-y-4">
              {layananList.map((item) => {
                const isSelected = formData.selectedLayanan?.includes(item.id);
                const isWisata = item.id.toLowerCase().includes('wisata');
                const Icon = ListCheck; // Generic icon for now since dynamic

                return (
                  <div key={item.id} className="relative">
                    <div 
                      onClick={() => {
                        const currentSelections = formData.selectedLayanan || [];
                        let newSelections;
                        if(currentSelections.includes(item.id)) {
                          newSelections = currentSelections.filter((id: string) => id !== item.id);
                        } else {
                          newSelections = [...currentSelections, item.id];
                        }
                        setFormData({...formData, selectedLayanan: newSelections});
                      }}
                      className={`flex items-center p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50/10' 
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                        isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-gray-900 text-xs sm:text-sm uppercase">{item.nama}</h4>
                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate mb-1">{item.deskripsi}</p>
                        <div className="text-emerald-600 font-black text-xs sm:text-sm">
                          Rp {(item.harga || 0).toLocaleString('id-ID')}
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ml-4 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {/* Expandable Wisata Options */}
                    {isWisata && isSelected && (
                      <div className="mt-2 ml-14 sm:ml-16 bg-[#f8fafc] rounded-xl p-4 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                        {WISATA_OPTIONS.map(cat => (
                          <div key={cat.category} className="mb-4 last:mb-0">
                            <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 border-b border-blue-100 pb-1 inline-block">{cat.category}</h5>
                            <div className="flex flex-wrap gap-2">
                              {cat.items.map(opt => {
                                const isOptSelected = formData.selectedWisata?.includes(opt);
                                return (
                                  <button
                                    key={opt}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const wSelections = formData.selectedWisata || [];
                                      let newWSelections;
                                      if(wSelections.includes(opt)) {
                                        newWSelections = wSelections.filter((w: string) => w !== opt);
                                      } else {
                                        newWSelections = [...wSelections, opt];
                                      }
                                      setFormData({...formData, selectedWisata: newWSelections});
                                    }}
                                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1 ${
                                      isOptSelected 
                                      ? 'border-blue-600 bg-white text-gray-800 shadow-sm' 
                                      : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
                                    }`}
                                  >
                                    <div className={`w-1.5 h-1.5 rounded-full ${isOptSelected ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total Beban Layanan Floating Panel */}
            <div className="fixed sm:absolute bottom-0 sm:bottom-4 left-0 sm:left-4 right-0 sm:right-4 z-20">
              <div className="bg-[#111424] sm:rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden border-t sm:border border-gray-800">
                <Receipt className="absolute -right-6 -top-6 w-32 h-32 text-blue-900/20 z-0" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                      <Receipt className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-black text-sm uppercase tracking-wide">TOTAL BEBAN LAYANAN</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">AKUMULASI BIAYA OPERASIONAL PER PAX</p>
                    </div>
                  </div>
                  <button className="hidden sm:block px-3 py-1.5 border border-gray-700 bg-gray-800 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-colors">
                    DETAIL BIAYA
                  </button>
                </div>
                
                <div className="flex justify-between items-end relative z-10">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500"/>
                    <span className="text-xs font-black text-blue-400 uppercase tracking-widest">PER JAMAAH</span>
                  </div>
                  <div className="text-white font-black text-2xl sm:text-3xl lg:text-4xl">
                    {(() => {
                      const total = layananList.reduce((sum, item) => {
                        if(formData.selectedLayanan?.includes(item.id)) {
                          return sum + (item.harga || 0);
                        }
                        return sum;
                      }, 0);
                      return `Rp ${total.toLocaleString('id-ID')}`;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Harga & Review */}
        {currentStepName === 'HARGA & REVIEW' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
              <h3 className="font-bold text-gray-700 uppercase tracking-wide text-xs sm:text-sm">
                LANGKAH 5: PERHITUNGAN HARGA & REVIEW PAKET
              </h3>
            </div>

            {(() => {
              // Calculators
              const hMadinah = hotelsList.find(h => h.id === formData.hotelMadinahId);
              const hMakkah = hotelsList.find(h => h.id === formData.hotelMakkahId);
              
              const hQuadMadinah = (hMadinah?.priceQuad || 0) * formData.durasiMadinah;
              const hQuadMakkah = (hMakkah?.priceQuad || 0) * formData.durasiMakkah;
              const hTripleMadinah = (hMadinah?.priceTriple || 0) * formData.durasiMadinah;
              const hTripleMakkah = (hMakkah?.priceTriple || 0) * formData.durasiMakkah;
              const hDoubleMadinah = (hMadinah?.priceDouble || 0) * formData.durasiMadinah;
              const hDoubleMakkah = (hMakkah?.priceDouble || 0) * formData.durasiMakkah;

              const maskapai = Number(formData.estimasiHargaMaskapai) || 0;
              const layananTotal = layananList.reduce((sum, item) => formData.selectedLayanan?.includes(item.id) ? sum + (item.harga || 0) : sum, 0);

              const baseQuad = maskapai + hQuadMadinah + hQuadMakkah + layananTotal;
              const baseTriple = maskapai + hTripleMadinah + hTripleMakkah + layananTotal;
              const baseDouble = maskapai + hDoubleMadinah + hDoubleMakkah + layananTotal;

              const margin = Number(formData.marginBersih) || 0;
              const adminFee = margin * 0.1;
              const totalMarkup = margin + adminFee;

              return (
                <div className="space-y-8">
                  {/* Bagian 1: HPP Dasar */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">1. HPP DASAR PER TIPE KAMAR</h4>
                      <div className="px-2 py-1 bg-gray-100 rounded text-[9px] font-bold text-gray-500">BIAYA MODAL</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { title: 'HPP QUAD', val: baseQuad },
                        { title: 'HPP TRIPLE', val: baseTriple },
                        { title: 'HPP DOUBLE', val: baseDouble }
                      ].map(item => (
                        <div key={item.title} className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.title}</span>
                          <span className="text-xl sm:text-2xl font-black text-gray-800">Rp {(item.val || 0).toLocaleString('id-ID')}</span>
                          <span className="text-[9px] font-bold text-gray-300 mt-1">PER PAX</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bagian 2: Pengaturan Profit */}
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-black text-blue-600 border-l-4 border-blue-600 pl-2 uppercase tracking-widest mb-4">
                      2. PENGATURAN PROFIT (UJROH MITRA)
                    </h4>
                    
                    <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 text-center relative overflow-hidden">
                      <div className="inline-block relative z-10 w-full max-w-sm mx-auto">
                        <div className="flex items-center justify-between mb-2">
                          <button 
                            onClick={() => setFormData({...formData, marginBersih: Math.max(0, margin - 50000)})}
                            className="w-12 h-12 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors bg-white shadow-sm"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          
                          <div className="flex-1 flex flex-col items-center px-4">
                            <div className="flex items-start text-blue-600">
                              <span className="text-lg sm:text-2xl font-black mt-1 sm:mt-2 italic mr-1">Rp</span>
                              <span className="text-4xl sm:text-6xl font-black italic tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>
                                {(margin || 0).toLocaleString('id-ID')}
                              </span>
                            </div>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-bold uppercase tracking-widest mt-2">MARGIN BERSIH</span>
                          </div>

                          <button 
                            onClick={() => setFormData({...formData, marginBersih: margin + 50000})}
                            className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 relative z-10 w-full max-w-lg mx-auto">
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 relative overflow-hidden flex flex-col items-start text-left">
                          <span className="text-[80px] font-black text-gray-100 absolute -right-4 -bottom-6 italic leading-none select-none">%</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 relative z-10">ADMIN FEE (10%)</span>
                          <span className="text-xl font-black text-gray-800 italic relative z-10">Rp {(adminFee || 0).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 relative flex flex-col items-start text-left">
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Plus className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">TOTAL MARKUP</span>
                          <span className="text-xl font-black text-blue-600 italic">Rp {(totalMarkup || 0).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                      
                      <div className="text-[9px] font-bold text-gray-300 mt-6 uppercase tracking-widest">
                        DATA ADMIN DIGUNAKAN UNTUK PENGELOLAAN APLIKASI AMANAH.
                      </div>
                    </div>
                  </div>

                  {/* Bagian 3: Harga Final */}
                  <div className="pt-4">
                    <h4 className="text-[10px] sm:text-xs font-black text-[#009B66] border-l-4 border-[#009B66] pl-2 uppercase tracking-widest mb-4">
                      3. HARGA JUAL MARKETPLACE (FINAL)
                    </h4>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4 pl-3 -mt-2">HARGA AKHIR PER PAX YANG AKAN TAYANG DI APLIKASI JAMAAH</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-center">
                      {[
                        { title: 'QUAD PACKAGE', val: baseQuad + totalMarkup, type: 'light', tagColor: 'text-[#009B66]' },
                        { title: 'TRIPLE PACKAGE', val: baseTriple + totalMarkup, type: 'dark', tagColor: 'text-blue-400' },
                        { title: 'DOUBLE PACKAGE', val: baseDouble + totalMarkup, type: 'light', tagColor: 'text-[#009B66]' },
                      ].map((item) => (
                        <div key={item.title} className={item.type === 'dark' ? "bg-[#111424] border border-gray-800 p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-2xl relative z-10 md:scale-110" : "bg-white border border-gray-100 p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"}>
                           <div className={`px-3 py-1 ${item.type === 'dark' ? 'bg-white/10 border-white/10' : 'bg-[#F2FDF8] border-[#E5F9F1]'} border rounded-lg mb-4`}>
                             <span className={`text-[8px] font-black uppercase tracking-widest ${item.tagColor}`}>{item.title}</span>
                           </div>
                           <div className={item.type === 'dark' ? "text-xl sm:text-3xl font-black text-white italic mb-2" : "text-xl sm:text-3xl font-black text-gray-900 italic mb-2"}>
                             <span className="text-sm sm:text-lg mr-1 inline-block">Rp</span>{(item.val || 0).toLocaleString('id-ID')}
                           </div>
                           <span className={item.type === 'dark' ? "text-[8px] font-bold text-gray-500 uppercase tracking-widest" : "text-[8px] font-bold text-gray-400 uppercase tracking-widest"}>ALL-IN / PER PAX</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                </div>
              );
            })()}
          </div>
        )}

        {/* Removed duplicate step 7 block */}

        {currentStepName === 'REVIEW FASILITAS' && formData.kategori !== 'WISATA HALAL' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
            
            {/* Top Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <button className="flex items-center justify-center gap-2 bg-[#1A1C29] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-lg">
                <Download className="w-4 h-4" />
                SIMPAN DESKRIPSI (PDF)
              </button>
              <button className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                <Sparkles className="w-4 h-4" />
                GENERATE ITINERARY AI
              </button>
              <button className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                <Sparkles className="w-4 h-4" />
                GENERATE MARKETING AI
              </button>
            </div>

            {(() => {
              // Same Calculators as Step 5
              const hMadinah = hotelsList.find(h => h.id === formData.hotelMadinahId);
              const hMakkah = hotelsList.find(h => h.id === formData.hotelMakkahId);
              
              const hWisata = hotelsList.find(h => h.id === formData.hotelWisataId);
              
              const hQuadMadinah = (hMadinah?.priceQuad || 0) * formData.durasiMadinah;
              const hQuadMakkah = (hMakkah?.priceQuad || 0) * formData.durasiMakkah;
              const hTripleMadinah = (hMadinah?.priceTriple || 0) * formData.durasiMadinah;
              const hTripleMakkah = (hMakkah?.priceTriple || 0) * formData.durasiMakkah;
              const hDoubleMadinah = (hMadinah?.priceDouble || 0) * formData.durasiMadinah;
              const hDoubleMakkah = (hMakkah?.priceDouble || 0) * formData.durasiMakkah;
              
              const hWisataTotal = formData.kategori === 'UMRAH PLUS' ? ((hWisata?.priceQuad || hWisata?.pricePerNight || 0) * (formData.durasiWisata || 0)) : 0;

              const maskapai = Number(formData.estimasiHargaMaskapai) || 0;
              const selectedLayanans = layananList.filter(item => formData.selectedLayanan?.includes(item.id));
              const layananTotal = selectedLayanans.reduce((sum, item) => sum + (item.harga || 0), 0);

              const baseQuad = maskapai + hWisataTotal + hQuadMadinah + hQuadMakkah + layananTotal;
              const baseTriple = maskapai + hWisataTotal + hTripleMadinah + hTripleMakkah + layananTotal;
              const baseDouble = maskapai + hWisataTotal + hDoubleMadinah + hDoubleMakkah + layananTotal;

              const margin = Number(formData.marginBersih) || 0;
              const adminFee = margin * 0.1;
              const totalMarkup = margin + adminFee;

              const finalQuad = baseQuad + totalMarkup;
              const finalTriple = baseTriple + totalMarkup;
              const finalDouble = baseDouble + totalMarkup;

              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  
                  {/* Left Column (Informasi & Fasilitas) */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Card 1: Informasi Dasar */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">INFORMASI DASAR PAKET</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">NAMA PAKET IBADAH</p>
                          <h4 className="text-xl sm:text-2xl font-black text-gray-800 italic uppercase">
                            {formData.nama || 'UNTITLED PACKAGE'}
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">KATEGORI & PROGRAM</p>
                            <p className="text-xs sm:text-sm font-black text-gray-700 uppercase">
                              {formData.kategori || 'UMRAH REGULER'} {formData.kategori === 'UMRAH PLUS' && `(+ ${formData.negaraWisata || 'TURKEY'})`} • {formData.periode || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">DURASI & JAMAAH</p>
                            <p className="text-xs sm:text-sm font-black text-gray-700 uppercase">
                              {formData.durasiHari || 9} HARI {formData.kategori === 'UMRAH PLUS' && `(${formData.durasiWisata || 0} HARI WISATA)`} - {formData.targetJamaah} PAX
                            </p>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">KEBERANGKATAN</p>
                            <p className="text-xs sm:text-sm font-black text-gray-700 uppercase flex items-center gap-2">
                              {formData.kotaKeberangkatan || 'JAKARTA'} 
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              {formData.kategori === 'UMRAH PLUS' ? (
                                <>
                                  {formData.alurPerjalanan === 'WISATA TERLEBIH DAHULU' ? (
                                    <>{formData.negaraWisata || 'TURKEY'} <ArrowRight className="w-3 h-3 text-gray-400" /> SAUDI</>
                                  ) : (
                                    <>SAUDI <ArrowRight className="w-3 h-3 text-gray-400" /> {formData.negaraWisata || 'TURKEY'}</>
                                  )}
                                </>
                              ) : (
                                'SAUDI'
                              )}
                            </p>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">TANGGAL & URUTAN</p>
                            <p className="text-xs sm:text-sm font-black text-gray-700 uppercase">
                              {formData.tglBerangkat || '-'} • {formData.kategori === 'UMRAH PLUS' ? formData.alurPerjalanan : formData.urutanKunjungan || 'MADINAH-MAKKAH'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Fasilitas & Rincian Harga */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <Check className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">FASILITAS & RINCIAN HARGA</h3>
                      </div>

                      <div className="space-y-4">
                        {/* Maskapai */}
                        <div className="flex justify-between items-center py-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                              <Plane className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-xs sm:text-sm text-gray-700 uppercase">{maskapaiList.find(m => m.id === formData.maskapaiId)?.name || 'MASKAPAI'} ({formData.kelasPenerbangan || 'EKONOMI'})</span>
                          </div>
                          <span className="font-black text-xs sm:text-sm text-blue-600 italic">Rp {Number(formData.estimasiHargaMaskapai || 0).toLocaleString('id-ID')}</span>
                        </div>

                        {/* Hotel Wisata IF Umrah Plus */}
                        {formData.kategori === 'UMRAH PLUS' && (
                          <div className="flex justify-between items-center py-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-xs sm:text-sm text-gray-700 uppercase">HOTEL {formData.negaraWisata || 'TURKEY'} ({hWisata?.nama || 'HILTON'})</span>
                            </div>
                            <span className="font-black text-xs sm:text-sm text-blue-600 italic">Rp {hWisataTotal.toLocaleString('id-ID')}</span>
                          </div>
                        )}

                        {hMadinah && (
                          <div className="flex justify-between items-center py-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-xs sm:text-sm text-gray-700 uppercase">{hMadinah.nama} ({formData.durasiMadinah || 3}M)</span>
                            </div>
                            <span className="font-black text-xs sm:text-sm text-blue-600 italic">Rp {(hQuadMadinah || 0).toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        {hMakkah && (
                          <div className="flex justify-between items-center py-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-xs sm:text-sm text-gray-700 uppercase">{hMakkah.nama} ({formData.durasiMakkah || 4}M)</span>
                            </div>
                            <span className="font-black text-xs sm:text-sm text-blue-600 italic">Rp {(hQuadMakkah || 0).toLocaleString('id-ID')}</span>
                          </div>
                        )}

                        {selectedLayanans.map(item => (
                          <div key={item.id} className="flex justify-between items-center py-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <Check className="w-4 h-4 text-emerald-500" />
                              </div>
                              <span className="font-bold text-xs sm:text-sm text-gray-700 uppercase">{item.nama}</span>
                            </div>
                            <span className="font-black text-xs sm:text-sm text-blue-600 italic">Rp {(item.harga || 0).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Right Column (Panel Harga Final - Sticky) */}
                  <div className="lg:sticky lg:top-8 bg-[#1A1C29] rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white border border-gray-800">
                    <Receipt className="absolute -right-8 -top-8 w-40 h-40 text-blue-900/20 z-0" />
                    
                    <div className="relative z-10 text-center mb-8 pb-6 border-b border-gray-800">
                      <div className="inline-block px-4 py-1.5 rounded-full border border-blue-900/50 bg-blue-900/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">
                        HARGA JUAL FINAL
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">LUMRAH DIBAYARKAN JAMAAH</p>
                    </div>

                    <div className="relative z-10 space-y-8">
                      {[
                        { title: 'QUAD ROOM', val: finalQuad },
                        { title: 'TRIPLE ROOM', val: finalTriple },
                        { title: 'DOUBLE ROOM', val: finalDouble },
                      ].map((item, idx) => (
                        <div key={item.title} className={idx !== 2 ? "border-b border-gray-800 pb-8" : ""}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.title}</span>
                            <span className="px-2 py-0.5 bg-blue-600 rounded text-[8px] font-black italic">PROFIT</span>
                          </div>
                          <div className="text-2xl sm:text-3xl font-black italic mb-1 flex items-start">
                            <span className="text-lg mt-1 mr-1">Rp</span>
                            {(item.val || 0).toLocaleString('id-ID')}
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                            <Layers className="w-3 h-3" />
                            INC. ADMIN (RP {(adminFee || 0).toLocaleString('id-ID')})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>
        )}

        {currentStepName === 'RINGKASAN HARGA' && formData.kategori === 'WISATA HALAL' && (() => {
          const baseIDR = (formData.hargaDasar || 1350) * 16000;
          let addonsTotal = 0;
          if (formData.wisataAddon_tourLeader) addonsTotal += 250000 * (Number(formData.wisataAddon_tourLeaderCount) || 1);
          if (formData.wisataAddon_handling) addonsTotal += 250000;
          if (formData.wisataAddon_travelKits) addonsTotal += 250000;
          if (formData.wisataAddon_merch_koper) addonsTotal += 1500000;
          if (formData.wisataAddon_merch_slingbag) addonsTotal += 50000;
          if (formData.wisataAddon_merch_kaos) addonsTotal += 150000;
          if (formData.wisataAddon_merch_jaket) addonsTotal += 250000;
          if (formData.wisataAddon_merch_tasserut) addonsTotal += 25000;
          if (formData.wisataAddon_merch_topi) addonsTotal += 35000;
          if (formData.wisataAddon_merch_spanduk) addonsTotal += 150000;
          
          const currentMargin = formData.wisataMargin !== undefined ? formData.wisataMargin : 100000;
          const adminFee = currentMargin * 0.1;
          const finalPrice = baseIDR + addonsTotal + currentMargin + adminFee;

          return (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              {/* Header Title */}
              <div className="flex flex-col items-center justify-center mb-8 relative">
                <h3 className="text-xl sm:text-2xl font-black text-[#1A1C29] tracking-wider uppercase mb-1 italic">
                  RINGKASAN HARGA PAKET
                </h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                  RINCIAN BIAYA DAN HARGA JUAL FINAL JAMAAH
                </p>
                <div className="sm:absolute sm:right-0 top-0 mt-4 sm:mt-0">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[9px] font-bold text-gray-600 hover:bg-gray-50 transition-colors uppercase tracking-widest">
                    <FileText className="w-3.5 h-3.5" /> PDF RINGKASAN
                  </button>
                </div>
              </div>

              {/* Layout Content */}
              <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
                
                {/* Left Column: Details */}
                <div className="flex-1 border border-gray-100 rounded-[2rem] p-6 lg:p-8 bg-white shadow-xl shadow-gray-200/40">
                  {/* INFORMASI DASAR PAKET */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <h4 className="font-black text-xs text-[#1A1C29] uppercase tracking-wider">INFORMASI DASAR PAKET</h4>
                      </div>
                      <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-[8px] font-bold text-gray-600 hover:bg-gray-50 uppercase">
                        <FileText className="w-3 h-3" /> PDF
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">NAMA PAKET</p>
                        <h5 className="font-black text-xs text-gray-900 uppercase">{formData.nama || 'BELUM DIISI'}</h5>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">DESTINASI & NEGARA</p>
                        <h5 className="font-black text-xs text-gray-900 uppercase">{formData.urutanKunjungan || 'BELUM DIISI'}</h5>
                        <p className="text-[9px] font-black text-blue-600 uppercase mt-0.5">{formData.negaraWisata || 'BELUM DIISI'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">TARGET JAMAAH & KEBERANGKATAN</p>
                        <h5 className="font-black text-xs text-gray-900 uppercase">{formData.targetJamaah || 0} PAX • {formData.tglBerangkat || 'BELUM DIISI'}</h5>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">DURASI & PILIHAN PAX</p>
                        <h5 className="font-black text-xs text-gray-900 uppercase">{formData.durasiHari || 0} HARI / PAX</h5>
                      </div>
                    </div>
                  </div>

                  {/* FASILITAS TERMASUK */}
                  <div>
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                        <ListCheck className="w-4 h-4" />
                      </div>
                      <h4 className="font-black text-xs text-[#1A1C29] uppercase tracking-wider">FASILITAS TERMASUK & RINCIAN HARGA</h4>
                    </div>

                    <div className="space-y-4">
                      {/* Base items */}
                      <div className="flex items-center justify-between pb-3 border-b border-gray-50 border-dotted">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-400">
                            <Plane className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-[10px] font-black text-gray-700 uppercase tracking-wider">TIKET PESAWAT PP</p>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 italic">Termasuk dalam Paket Dasar</p>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-50 border-dotted">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-400">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-[10px] font-black text-gray-700 uppercase tracking-wider">AKOMODASI HOTEL WISATA</p>
                        </div>
                        <p className="text-[10px] font-black text-gray-700 italic">Rp {baseIDR.toLocaleString('id-ID')}</p>
                      </div>

                      {/* Addons List */}
                      {formData.wisataAddon_handling && (
                        <div className="flex items-center justify-between pb-3 border-b border-gray-50 border-dotted">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-400">
                              <Shield className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-wider">HANDLING DOMESTIK</p>
                          </div>
                          <p className="text-[10px] font-black text-gray-700 italic">Rp 250.000</p>
                        </div>
                      )}
                      
                      {formData.wisataAddon_travelKits && (
                        <div className="flex items-center justify-between pb-3 border-b border-gray-50 border-dotted">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-400">
                              <Briefcase className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-wider">TRAVEL KITS</p>
                          </div>
                          <p className="text-[10px] font-black text-gray-700 italic">Rp 250.000</p>
                        </div>
                      )}
                      
                      {formData.wisataAddon_tourLeader && (
                        <div className="flex items-center justify-between pb-3 border-b border-gray-50 border-dotted">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-400">
                              <UserCheck className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-wider">TOUR LEADER ({formData.wisataAddon_tourLeaderCount || 1} PAX)</p>
                          </div>
                          <p className="text-[10px] font-black text-gray-700 italic">Rp {(250000 * (Number(formData.wisataAddon_tourLeaderCount) || 1)).toLocaleString('id-ID')}</p>
                        </div>
                      )}

                      {/* Merch */}
                      {[
                        {id: 'koper', name: 'KOPER CUSTOM', price: 1500000, icon: Briefcase},
                        {id: 'slingbag', name: 'SLING BAG', price: 50000, icon: ShoppingBag},
                        {id: 'kaos', name: 'KAOS GRUP', price: 150000, icon: Shirt},
                        {id: 'jaket', name: 'JACKET GRUP', price: 250000, icon: Shirt},
                        {id: 'tasserut', name: 'TAS SERUT', price: 25000, icon: ShoppingBag},
                        {id: 'topi', name: 'TOPI', price: 35000, icon: User},
                        {id: 'spanduk', name: 'SPANDUK ROMBONGAN', price: 150000, icon: FileText},
                      ].map(item => {
                         if (!formData[`wisataAddon_merch_${item.id}`]) return null;
                         const Icon = item.icon;
                         return (
                           <div key={item.id} className="flex items-center justify-between pb-3 border-b border-gray-50 border-dotted">
                             <div className="flex items-center gap-3">
                               <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-400">
                                 <Icon className="w-3.5 h-3.5" />
                               </div>
                               <p className="text-[10px] font-black text-gray-700 uppercase tracking-wider">{item.name}</p>
                             </div>
                             <p className="text-[10px] font-black text-gray-700 italic">Rp {item.price.toLocaleString('id-ID')}</p>
                           </div>
                         )
                      })}

                      {/* Margins */}
                      <div className="flex items-center justify-between pt-2 pb-3 border-b border-gray-50 border-dotted">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-green-50 flex items-center justify-center text-green-500">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-[10px] font-black text-green-600 uppercase tracking-wider">KOMISI MITRA / PAX</p>
                        </div>
                        <p className="text-[10px] font-black text-green-600 italic">Rp {currentMargin.toLocaleString('id-ID')}</p>
                      </div>

                      <div className="flex items-center justify-between pb-3 border-b border-gray-50 border-dotted mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-400">
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-[10px] font-black text-gray-700 uppercase tracking-wider">ADMIN FEE (10%)</p>
                        </div>
                        <p className="text-[10px] font-black text-gray-700 italic">Rp {adminFee.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Hero Final Price */}
                <div className="w-full lg:w-[320px] bg-[#131620] rounded-[2rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-0 right-[-20%] w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 z-10">HARGA JUAL FINAL</h4>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-10 z-10">PER PAX (ALL-IN)</p>

                  <div className="z-10 mt-10 mb-8">
                    <h1 className="font-black text-4xl text-white tracking-tight italic flex flex-col items-center">
                      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 mb-1">Rp</span>
                      {finalPrice.toLocaleString('id-ID')}
                    </h1>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded border border-white/10 mt-4 z-10">
                    <span className="text-[7px] font-black text-gray-300 uppercase tracking-widest">HARGA JUAL JAMAAH</span>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {currentStepName === 'PUBLIKASI & DESKRIPSI' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* 1. UPLOAD FOTO UTAMA */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-black mt-0.5">1.</span>
                <div className="flex flex-col">
                  <h3 className="font-black text-gray-900 text-sm tracking-widest uppercase">UPLOAD FOTO UTAMA PAKET</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">GUNAKAN FOTO TERBAIK UNTUK MENARIK JAMAAH</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="w-full h-80 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group relative overflow-hidden">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ImagePlus className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-wider">Klik atau seret foto ke sini</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-2">PNG, JPG (MAX 5MB)</p>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              {/* 2. TIPE PUBLIKASI */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-black mt-0.5">2.</span>
                  <div className="flex flex-col">
                    <h3 className="font-black text-gray-900 text-sm tracking-widest uppercase">TIPE PUBLIKASI</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { id: 'PAKET PRIBADI', icon: Lock },
                    { id: 'TEMPLATE PUBLIK', icon: Globe }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setFormData({...formData, tipePublikasi: item.id})}
                      className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                        formData.tipePublikasi === item.id 
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' 
                          : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      <item.icon className="w-8 h-8" strokeWidth={1.5} />
                      <span className="text-[10px] font-black tracking-widest uppercase text-center">{item.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. TIPE PENJUALAN */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-black mt-0.5">3.</span>
                  <div className="flex flex-col">
                    <h3 className="font-black text-gray-900 text-sm tracking-widest uppercase">TIPE PENJUALAN</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { id: 'JUAL SENDIRI', icon: User },
                    { id: 'JUAL BERSAMA', icon: Users }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setFormData({...formData, tipePenjualan: item.id})}
                      className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                        formData.tipePenjualan === item.id 
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' 
                          : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      <item.icon className="w-8 h-8" strokeWidth={1.5} />
                      <span className="text-[10px] font-black tracking-widest uppercase text-center">{item.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bagian 4: Pembagian Hasil (hanya muncul jika jual bersama) */}
            {formData.tipePenjualan === 'JUAL BERSAMA' && (
              <div className="bg-[#1A1C29] p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 mt-8 border border-gray-800">
                {/* Header Panel */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b border-gray-800 space-y-4 sm:space-y-0">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
                      <ArrowRightLeft className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-emerald-400 font-black text-lg uppercase tracking-wide">PEMBAGIAN HASIL (SHARING)</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">TENTUKAN KOMISI UNTUK MITRA PENJUAL (RESELLER/AGEN)</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-emerald-950/40 border border-emerald-500/40 rounded-full text-emerald-400 text-[10px] font-black tracking-widest uppercase">
                    COLLABORATION
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center z-10 relative">
                  
                  {/* Left: Input Ujroh Partner */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ujroh Sharing</span>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        MAKS. RP {(Number(formData.marginBersih) || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-[#11131C] border border-gray-800 rounded-2xl p-4 shadow-inner">
                      <button 
                        onClick={() => setFormData({...formData, ujrohPartner: Math.max(0, (Number(formData.ujrohPartner) || 0) - 50000)})}
                        className="w-10 h-10 rounded-xl bg-gray-800 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <div className="text-2xl font-black italic">
                        Rp {(Number(formData.ujrohPartner) || 0).toLocaleString('id-ID')}
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, ujrohPartner: Math.min((Number(formData.marginBersih) || 0), (Number(formData.ujrohPartner) || 0) + 50000)})}
                        className="w-10 h-10 rounded-xl bg-emerald-500 flex flex-col items-center justify-center text-emerald-950 hover:bg-emerald-400 hover:scale-105 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Right: Breakdown Dashboard */}
                  <div className="border border-gray-800 rounded-2xl p-6 bg-[#11131C] space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">UJROH ANDA (OWNER)</span>
                      <span className="font-black text-sm sm:text-base italic text-white">Rp {((Number(formData.marginBersih) || 0) - (Number(formData.ujrohPartner) || 0)).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">UJROH PARTNER (SELLER)</span>
                      <span className="font-black text-sm sm:text-base italic text-emerald-400">Rp {(Number(formData.ujrohPartner) || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-widest">TOTAL UJROH PAKET</span>
                      <span className="font-black text-base sm:text-lg italic text-blue-400">Rp {(Number(formData.marginBersih) || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {currentStepName === 'VALIDASI AKHIR' && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 relative">
              <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Check className="w-6 h-6 text-white" strokeWidth={3} />
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-[#1A1C29] mb-3 uppercase tracking-wide">PAKET SIAP DIVALIDASI!</h3>
            <p className="text-[11px] font-bold text-gray-500 max-w-md mx-auto leading-relaxed mb-10">
              Paket Anda telah berhasil dikonfigurasi. Silakan ajukan validasi ke tim Operasional untuk peninjauan akhir sebelum dipublikasikan atau dijual ke Mitra.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-between items-center bg-[#F8F9FB] border border-gray-200 rounded-[2rem] p-6 mb-10 shadow-inner">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm text-emerald-500">
                  <Check className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">STATUS</p>
                  <p className="text-sm font-black text-emerald-600 uppercase">MENUNGGU VALIDASI</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">NAMA PAKET</p>
                <p className="text-sm font-black text-gray-900 uppercase max-w-[200px] truncate">{formData.nama || 'BELUM DIISI'}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <button 
                onClick={handlePrev}
                className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center justify-center text-[10px] uppercase tracking-widest shadow-sm transition-colors"
                disabled={isSaving}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> KEMBALI
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2 font-bold rounded-xl shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 text-[10px] sm:text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                {isSaving ? 'MENYIMPAN...' : 'SIMPAN & SELESAI'}
                {!isSaving && <ChevronRight className="w-4 h-4 ml-1" />}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      {currentStepName !== 'VALIDASI AKHIR' && (
        formData.kategori === 'WISATA HALAL' && currentStepName === 'INFORMASI DASAR' ? (
          <div className="mt-8">
            <button 
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl transition-colors shadow-lg bg-[#009B66] hover:bg-[#008A5A] text-white shadow-[#009B66]/20 text-[10px] sm:text-xs uppercase tracking-widest"
            >
              LIHAT PAKET <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        ) : formData.kategori === 'WISATA HALAL' && currentStepName === 'PILIH PAKET WISATA' ? (
          <div className="border-t border-gray-100 mt-10 pt-6 flex gap-4">
            <button 
              onClick={handlePrev}
              className="flex-shrink-0 px-6 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> KEMBALI
            </button>
            <button 
              onClick={handleNext}
              disabled={!formData.paketWisataId}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl transition-colors shadow-lg bg-[#009B66] hover:bg-[#008A5A] text-white shadow-[#009B66]/20 text-[10px] sm:text-xs uppercase tracking-widest disabled:opacity-50"
            >
              LANJUT DETAIL <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        ) : formData.kategori === 'WISATA HALAL' && currentStepName === 'DETAIL INFO' ? (
          <div className="border-t border-gray-100 mt-10 pt-6 flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <button 
              onClick={handlePrev}
              className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center text-[10px] sm:text-xs uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> KEMBALI
            </button>
            <button 
              onClick={handleNext}
              className="px-8 py-3.5 flex items-center gap-2 font-bold rounded-xl shadow-lg bg-[#009B66] hover:bg-[#008A5A] text-white shadow-[#009B66]/20 text-[10px] sm:text-xs uppercase tracking-widest"
            >
              LANJUT REVIEW <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        ) : formData.kategori === 'WISATA HALAL' && currentStepName === 'LAYANAN TAMBAHAN' ? (
          <div className="border-t border-gray-100 mt-10 pt-6 flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <button 
              onClick={handlePrev}
              className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center text-[10px] sm:text-xs uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> KEMBALI
            </button>
            <button 
              onClick={handleNext}
              className="px-8 py-3.5 flex items-center gap-2 font-bold rounded-xl shadow-lg bg-[#009B66] hover:bg-[#008A5A] text-white shadow-[#009B66]/20 text-[10px] sm:text-xs uppercase tracking-widest"
            >
              LANJUT SUMMARY <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        ) : formData.kategori === 'WISATA HALAL' && currentStepName === 'REVIEW FASILITAS' ? (
          <div className="border-t border-gray-100 mt-10 pt-6 flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <button 
              onClick={handlePrev}
              className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center text-[10px] sm:text-xs uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> KEMBALI
            </button>
            <button 
              onClick={handleNext}
              className="px-8 py-3.5 flex items-center gap-2 font-bold rounded-xl shadow-lg bg-[#009B66] hover:bg-[#008A5A] text-white shadow-[#009B66]/20 text-[10px] sm:text-xs uppercase tracking-widest"
            >
              LANJUT RINGKASAN <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        ) : formData.kategori === 'WISATA HALAL' && currentStepName === 'RINGKASAN HARGA' ? (
          <div className="border-t border-gray-100 mt-10 pt-6 flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <button 
              onClick={handlePrev}
              className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center text-[10px] sm:text-xs uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> KEMBALI
            </button>
            <button 
              onClick={handleNext}
              className="px-8 py-3.5 flex items-center gap-2 font-bold rounded-xl shadow-lg bg-[#009B66] hover:bg-[#008A5A] text-white shadow-[#009B66]/20 text-[10px] sm:text-xs uppercase tracking-widest"
            >
              LANJUT VALIDASI <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        ) : (
          <div className="border-t border-gray-100 mt-10 pt-6 flex justify-between items-center">
            {currentStep > 1 ? (
              <button 
                onClick={handlePrev}
                className="px-6 py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Kembali
              </button>
            ) : <div />}

              <button 
                onClick={currentStepName === 'PUBLIKASI & DESKRIPSI' ? handleSave : handleNext}
                disabled={isSaving}
                className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl transition-colors shadow-lg disabled:opacity-50 ${
                  currentStepName === 'PUBLIKASI & DESKRIPSI'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 uppercase text-xs tracking-wider' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                }`}
              >
                {isSaving ? 'MENYIMPAN...' : (currentStepName === 'PUBLIKASI & DESKRIPSI' ? 'SIMPAN & SELESAI' : 'Lanjutkan')}
                {isSaving ? null : <ChevronRight className="w-5 h-5" />}
              </button>
          </div>
        )
      )}
    </div>
  );
};
