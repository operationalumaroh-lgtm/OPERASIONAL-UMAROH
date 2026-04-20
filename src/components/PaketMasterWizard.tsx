import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowLeft, Check, Search, Building2, MapPin, Star, Calendar, Minus, Plus, User, Smartphone, FileText, Bus, Shield, BookOpen, Home, Map, Train, Users, UserCheck, Receipt, Download, Sparkles, Layers, ImagePlus, Lock, Globe, ArrowRightLeft, MessageCircle, Plane, ListCheck, ArrowRight } from 'lucide-react';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc, onSnapshot } from 'firebase/firestore';

interface PaketMasterWizardProps {
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

const KATEGORI_PROGRAM = ['UMRAH REGULAR', 'UMRAH PLUS', 'UMRAH LA', 'WISATA HALAL'];

const getSteps = (kategori: string) => {
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

const LAYANAN_ITEMS = [
  { id: 'handling_saudi', name: 'HANDLING SAUDI', subtitle: 'PENANGANAN DI ARAB SAUDI', price: 281000, icon: Smartphone },
  { id: 'muthawif', name: 'MUTHAWIF', subtitle: 'PEMBIMBING IBADAH LOKAL', price: 0, icon: UserCheck },
  { id: 'visa', name: 'VISA', subtitle: 'DOKUMEN IZIN MASUK SAUDI', price: 850000, icon: FileText },
  { id: 'transportasi', name: 'TRANSPORTASI', subtitle: 'BUS ANTAR KOTA & JAMAAH', price: 1000000, icon: Bus },
  { id: 'asuransi', name: 'ASURANSI', subtitle: 'PERLINDUNGAN PERJALANAN', price: 0, icon: Shield },
  { id: 'manasik', name: 'MANASIK', subtitle: 'PEMBEKALAN IBADAH', price: 300000, icon: BookOpen },
  { id: 'handling_domestik', name: 'HANDLING DOMESTIK', subtitle: 'PENANGANAN DI BANDARA ASAL', price: 50150, icon: Home },
  { id: 'wisata', name: 'WISATA/ZIARAH', subtitle: 'CITY TOUR MAKKAH & MADINAH', price: 125000, icon: Map },
  { id: 'kereta', name: 'KERETA CEPAT', subtitle: 'TRANSPORTASI CEPAT ANTAR KOTA', price: 310000, icon: Train },
  { id: 'tour_leader', name: 'TOUR LEADER', subtitle: 'PENDAMPING DARI TANAH AIR', price: 1000000, icon: Users }
];

const WISATA_OPTIONS = [
  { category: 'MAKKAH', items: ['City Tour Makkah', 'Jabal Nur', 'Jabal Tsur', 'Museum Makkah'] },
  { category: 'MADINAH', items: ['City Tour Madinah', 'Jabal Uhud', 'Masjid Quba', 'Kebun Kurma', 'Percetakan Al-Quran'] }
];

const DUMMY_HOTELS = [
  {
    id: 'h1',
    name: 'HOTEL MADINAH DUMMY',
    location: 'AL-MADINAH AL-MUNAWWARAH',
    city: 'madinah',
    stars: 5,
    distance: '150M',
    priceQuad: 1000000,
    priceTriple: 1300000,
    priceDouble: 1500000,
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'h2',
    name: 'HOTEL MAKKAH DUMMY',
    location: 'MAKKAH AL-MUKARRAMAH',
    city: 'makkah',
    stars: 5,
    distance: '200M',
    priceQuad: 1200000,
    priceTriple: 1500000,
    priceDouble: 1800000,
    image: 'https://images.unsplash.com/photo-1565552643983-6ccfb5e87a2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

const DUMMY_HOTELS_WISATA = [
  {
    id: 'hw1',
    name: 'TITANIC CITY TAKSIM',
    location: 'TURKEY',
    stars: 4,
    pricePerNight: 1200000,
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hw2',
    name: 'ELITE WORLD ISTANBUL',
    location: 'TURKEY',
    stars: 5,
    pricePerNight: 1850000,
    image: 'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hw3',
    name: 'HILTON PARIS OPERA',
    location: 'FRANCE',
    stars: 5,
    pricePerNight: 4500000,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

export const PaketMasterWizard: React.FC<PaketMasterWizardProps> = ({ initialData, onCancel, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [hotelStep, setHotelStep] = useState<'madinah' | 'makkah'>('madinah');
  const [maskapaiList, setMaskapaiList] = useState<any[]>([]);
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
    hotelMadinahId: 'h1', // defaulted to match mock
    chkInMadinah: '',
    durasiMadinah: 3,
    chkOutMadinah: '',
    hotelMakkahId: 'h2', // defaulted to match mock
    chkInMakkah: '',
    durasiMakkah: 4,
    chkOutMakkah: '',
    hotelWisataId: 'hw1',
    selectedLayanan: LAYANAN_ITEMS.map(i => i.id), // By default mostly all selected based on mock
    selectedWisata: ['City Tour Makkah', 'City Tour Madinah'], // some mock selections
    marginBersih: 1000000, // default profit 1jt
    ujrohPartner: 0
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'maskapai'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaskapaiList(data);
    });
    return () => unsub();
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
        estimasiHargaMaskapai: Number(formData.estimasiHargaMaskapai || 0)
      };

      if (initialData?.id) {
        await updateDoc(doc(db, 'paket_master', initialData.id), dataToSave);
      } else {
        await addDoc(collection(db, 'paket_master'), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
      }
      // Instead of onSuccess, go to the final validation step
      handleNext();
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
          </div>
        )}

        {currentStepName === 'MASKAPAI' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
              {DUMMY_HOTELS_WISATA.map(hotel => {
                const isSelected = formData.hotelWisataId === hotel.id;
                return (
                  <div 
                    key={hotel.id} 
                    onClick={() => setFormData({...formData, hotelWisataId: hotel.id})}
                    className={`bg-white rounded-2xl overflow-hidden border-2 cursor-pointer transition-all flex flex-col ${isSelected ? 'border-blue-500 shadow-[0_8px_30px_rgba(59,130,246,0.15)] ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <div className="h-44 overflow-hidden relative">
                      <img src={hotel.image} className="w-full h-full object-cover transition-transform hover:scale-105" alt={hotel.name} />
                      <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-white font-black uppercase text-sm mb-1">{hotel.name}</h4>
                        <div className="flex items-center gap-1">
                           {[...Array(hotel.stars)].map((_, i) => (
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
                          <div className="text-blue-700 font-black text-xl">Rp {(hotel.pricePerNight * formData.durasiWisata).toLocaleString('id-ID')}</div>
                        </div>
                        <div className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[9px] font-bold">
                          1 PAX
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">HARI / MALAM</span>
                          <span className="text-[10px] text-gray-900 font-bold">Rp {hotel.pricePerNight.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">DURASI ({formData.durasiWisata} MALAM)</span>
                          <span className="text-[10px] text-gray-900 font-bold">Rp {(hotel.pricePerNight * formData.durasiWisata).toLocaleString('id-ID')}</span>
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
              {DUMMY_HOTELS.filter(h => h.city === hotelStep).map(hotel => {
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
                    <div className="h-40 overflow-hidden relative">
                      <img src={hotel.image} className="w-full h-full object-cover transition-transform hover:scale-105" alt={hotel.name} />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h4 className="text-white font-black uppercase text-sm mb-1">{hotel.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4">{hotel.location}</p>
                      
                      <div className="flex gap-2 mb-6">
                        <span className="bg-[#1e2336] text-amber-500 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-amber-500"/> {hotel.stars}</span>
                        <span className="bg-[#1e2336] text-blue-400 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1"><MapPin className="w-3 h-3"/> {hotel.distance}</span>
                      </div>
                      
                      <div className="mt-auto flex justify-between items-end">
                        <div>
                          <div className="text-emerald-400 font-black text-lg">Rp {hotel.priceQuad.toLocaleString('id-ID')} <span className="text-[10px] text-gray-500 font-bold">/ MALAM</span></div>
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
                  const hObj = DUMMY_HOTELS.find(h => h.id === hId);
                  
                  if (!hObj) return null;
                  
                  return (
                    <div key={citySpan} className="border border-[#116e4d] bg-[#0c6344] rounded-xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-emerald-100 text-[10px] font-bold uppercase tracking-wider">HOTEL {citySpan.toUpperCase()}: {hObj.name}</span>
                        <span className="text-emerald-100 text-[10px] font-bold bg-[#116e4d] px-2 py-1 rounded-md">{durasi} MALAM</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-[#167855] rounded-lg p-2.5 text-center border border-[#1e8c65]">
                          <div className="text-emerald-200 text-[9px] font-bold uppercase mb-1 tracking-wider">QUAD</div>
                          <div className="text-white font-black text-sm">Rp {(hObj.priceQuad * durasi).toLocaleString('id-ID')}</div>
                        </div>
                        <div className="bg-[#167855] rounded-lg p-2.5 text-center border border-[#1e8c65]">
                          <div className="text-emerald-200 text-[9px] font-bold uppercase mb-1 tracking-wider">TRIPLE</div>
                          <div className="text-white font-black text-sm">Rp {(hObj.priceTriple * durasi).toLocaleString('id-ID')}</div>
                        </div>
                        <div className="bg-[#167855] rounded-lg p-2.5 text-center border border-[#1e8c65]">
                          <div className="text-emerald-200 text-[9px] font-bold uppercase mb-1 tracking-wider">DOUBLE</div>
                          <div className="text-white font-black text-sm">Rp {(hObj.priceDouble * durasi).toLocaleString('id-ID')}</div>
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
                      const hMadinah = DUMMY_HOTELS.find(h => h.id === formData.hotelMadinahId);
                      const hMakkah = DUMMY_HOTELS.find(h => h.id === formData.hotelMakkahId);
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
              {LAYANAN_ITEMS.map((item) => {
                const isSelected = formData.selectedLayanan?.includes(item.id);
                const isWisata = item.id === 'wisata';
                const Icon = item.icon;

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
                        <h4 className="font-black text-gray-900 text-xs sm:text-sm uppercase">{item.name}</h4>
                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate mb-1">{item.subtitle}</p>
                        <div className="text-emerald-600 font-black text-xs sm:text-sm">
                          Rp {item.price.toLocaleString('id-ID')}
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
                      const total = LAYANAN_ITEMS.reduce((sum, item) => {
                        if(formData.selectedLayanan?.includes(item.id)) {
                          return sum + item.price;
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
              const hMadinah = DUMMY_HOTELS.find(h => h.id === formData.hotelMadinahId);
              const hMakkah = DUMMY_HOTELS.find(h => h.id === formData.hotelMakkahId);
              
              const hQuadMadinah = (hMadinah?.priceQuad || 0) * formData.durasiMadinah;
              const hQuadMakkah = (hMakkah?.priceQuad || 0) * formData.durasiMakkah;
              const hTripleMadinah = (hMadinah?.priceTriple || 0) * formData.durasiMadinah;
              const hTripleMakkah = (hMakkah?.priceTriple || 0) * formData.durasiMakkah;
              const hDoubleMadinah = (hMadinah?.priceDouble || 0) * formData.durasiMadinah;
              const hDoubleMakkah = (hMakkah?.priceDouble || 0) * formData.durasiMakkah;

              const maskapai = Number(formData.estimasiHargaMaskapai) || 0;
              const layananTotal = LAYANAN_ITEMS.reduce((sum, item) => formData.selectedLayanan?.includes(item.id) ? sum + item.price : sum, 0);

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

                  {/* Bagian 3: Harga Jual */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">3. HARGA JUAL MARKETPLACE (FINAL)</h4>
                      <div className="px-3 py-1 bg-emerald-50 rounded-lg text-[9px] font-bold text-emerald-600 border border-emerald-100">HARGA TAMPIL</div>
                    </div>
                    
                    <div className="bg-[#111424] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                      <Receipt className="absolute -right-10 -bottom-10 w-48 h-48 text-white/[0.02] z-0" />
                      
                      <div className="flex flex-col sm:flex-row gap-6 sm:gap-4 justify-between relative z-10 border-b border-gray-800 pb-6 mb-6">
                        {[
                          { title: 'FINAL QUAD / PAX', val: baseQuad + totalMarkup },
                          { title: 'FINAL TRIPLE / PAX', val: baseTriple + totalMarkup },
                          { title: 'FINAL DOUBLE / PAX', val: baseDouble + totalMarkup }
                        ].map(item => (
                          <div key={item.title}>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.title}</div>
                            <div className="text-2xl sm:text-3xl font-black text-white">Rp {(item.val || 0).toLocaleString('id-ID')}</div>
                          </div>
                        ))}
                      </div>

                      <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                          <Check className="w-5 h-5 text-white" strokeWidth={3} />
                        </div>
                        <div>
                          <div className="text-white font-black text-sm uppercase tracking-wide">SIAP DIPUBLIKASIKAN</div>
                          <div className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            PAKET AKAN TAYANG DENGAN KAPASITAS {formData.targetJamaah} JAMAAH
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              );
            })()}
          </div>
        )}

        {/* Placeholder for other steps */}
        {[7].includes(currentStep) && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Bagian 1: Upload Foto */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">1. UPLOAD FOTO UTAMA PAKET</h3>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest ml-4 mb-4">
                GUNAKAN FOTO TERBAIK UNTUK MENARIK JAMAAH
              </p>
              
              <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer bg-white group">
                <div className="w-16 h-16 bg-gray-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  <ImagePlus className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                </div>
                <p className="text-gray-900 font-bold mb-1">Klik atau seret foto ke sini</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">PNG, JPG (MAX 5MB)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bagian 2: Tipe Publikasi */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">2. TIPE PUBLIKASI</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setFormData({...formData, tipePublikasi: 'pribadi'})}
                    className={`p-6 rounded-2xl text-center transition-all bg-white border ${formData.tipePublikasi === 'pribadi' ? 'border-blue-600 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 ${formData.tipePublikasi === 'pribadi' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${formData.tipePublikasi === 'pribadi' ? 'text-blue-600' : 'text-gray-500'}`}>PAKET PRIBADI</p>
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, tipePublikasi: 'publik'})}
                    className={`p-6 rounded-2xl text-center transition-all bg-white border ${formData.tipePublikasi === 'publik' ? 'border-blue-600 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 ${formData.tipePublikasi === 'publik' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${formData.tipePublikasi === 'publik' ? 'text-blue-600' : 'text-gray-500'}`}>TEMPLATE PUBLIK</p>
                  </button>
                </div>
              </div>

              {/* Bagian 3: Tipe Penjualan */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">3. TIPE PENJUALAN</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setFormData({...formData, tipePenjualan: 'sendiri'})}
                    className={`p-6 rounded-2xl text-center transition-all bg-white border ${formData.tipePenjualan === 'sendiri' ? 'border-emerald-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 ${formData.tipePenjualan === 'sendiri' ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                      <User className="w-5 h-5" />
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${formData.tipePenjualan === 'sendiri' ? 'text-emerald-500' : 'text-gray-500'}`}>JUAL SENDIRI</p>
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, tipePenjualan: 'bersama'})}
                    className={`p-6 rounded-2xl text-center transition-all bg-white border ${formData.tipePenjualan === 'bersama' ? 'border-emerald-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 ${formData.tipePenjualan === 'bersama' ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${formData.tipePenjualan === 'bersama' ? 'text-emerald-500' : 'text-gray-500'}`}>JUAL BERSAMA</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Bagian 4: Pembagian Hasil (hanya muncul jika jual bersama) */}
            {formData.tipePenjualan === 'bersama' && (
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

        {currentStepName === 'REVIEW FASILITAS' && (
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
              const hMadinah = DUMMY_HOTELS.find(h => h.id === formData.hotelMadinahId);
              const hMakkah = DUMMY_HOTELS.find(h => h.id === formData.hotelMakkahId);
              const hWisata = DUMMY_HOTELS_WISATA.find(h => h.id === formData.hotelWisataId);
              
              const hQuadMadinah = (hMadinah?.priceQuad || 0) * formData.durasiMadinah;
              const hQuadMakkah = (hMakkah?.priceQuad || 0) * formData.durasiMakkah;
              const hTripleMadinah = (hMadinah?.priceTriple || 0) * formData.durasiMadinah;
              const hTripleMakkah = (hMakkah?.priceTriple || 0) * formData.durasiMakkah;
              const hDoubleMadinah = (hMadinah?.priceDouble || 0) * formData.durasiMadinah;
              const hDoubleMakkah = (hMakkah?.priceDouble || 0) * formData.durasiMakkah;
              
              const hWisataTotal = formData.kategori === 'UMRAH PLUS' ? ((hWisata?.pricePerNight || 0) * (formData.durasiWisata || 0)) : 0;

              const maskapai = Number(formData.estimasiHargaMaskapai) || 0;
              const selectedLayanans = LAYANAN_ITEMS.filter(item => formData.selectedLayanan?.includes(item.id));
              const layananTotal = selectedLayanans.reduce((sum, item) => sum + item.price, 0);

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
                              <span className="font-bold text-xs sm:text-sm text-gray-700 uppercase">HOTEL {formData.negaraWisata || 'TURKEY'} ({hWisata?.name || 'TITANIC CITY TAKSIM'})</span>
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
                              <span className="font-bold text-xs sm:text-sm text-gray-700 uppercase">{hMadinah.name} ({formData.durasiMadinah || 3}M)</span>
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
                              <span className="font-bold text-xs sm:text-sm text-gray-700 uppercase">{hMakkah.name} ({formData.durasiMakkah || 4}M)</span>
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
                              <span className="font-bold text-xs sm:text-sm text-gray-700 uppercase">{item.name}</span>
                            </div>
                            <span className="font-black text-xs sm:text-sm text-blue-600 italic">Rp {item.price.toLocaleString('id-ID')}</span>
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
                  {['B2C (PUBLIC)', 'B2B (MITRA)', 'INTERNAL ONLY', 'PRIVATE'].map(item => (
                    <button
                      key={item}
                      onClick={() => setFormData({...formData, tipePublikasi: item})}
                      className={`p-4 rounded-2xl border-2 text-[10px] font-black tracking-widest uppercase text-left transition-all ${
                        formData.tipePublikasi === item 
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' 
                          : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      {item}
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
                  {['INDIVIDUAL', 'GROUP/COMMUNITY', 'FAMILY PACKAGE', 'CORPORATE'].map(item => (
                    <button
                      key={item}
                      onClick={() => setFormData({...formData, tipePenjualan: item})}
                      className={`p-4 rounded-2xl border-2 text-[10px] font-black tracking-widest uppercase text-left transition-all ${
                        formData.tipePenjualan === item 
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' 
                          : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Deskripsi Lengkap Paket (Optional but Good here) */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-gray-50 shadow-sm mt-6">
              <label className="block text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest italic">Deskripsi lengkap atau syarat & ketentuan khusus:</label>
              <textarea
                rows={4}
                placeholder="Deskripsikan paket secara detail, keunggulan, atau catatan tambahan..."
                value={formData.deskripsi || ''}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-medium transition-all"
              />
            </div>
          </div>
        )}

        {currentStepName === 'VALIDASI AKHIR' && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in zoom-in-95 duration-500">
            <div className="w-32 h-32 bg-emerald-50 rounded-[3rem] flex items-center justify-center mb-0 relative">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-sm">
                <Sparkles className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            
            <h3 className="text-4xl font-black italic text-[#1A1C29] mt-8 mb-4">LUAR BIASA!</h3>
            <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest max-w-md mx-auto leading-relaxed mb-10">
              PAKET UMRAH {formData.kategori.toUpperCase()} SIAP DIAJUKAN<br />UNTUK VALIDASI OPERASIONAL.
            </p>
            
            <div className="flex flex-col items-center gap-6">
              <button onClick={() => window.open(`https://wa.me/?text=Halo,%20saya%20ingin%20mengajukan%20validasi%20operasional%20untuk%20paket%20${encodeURIComponent(formData.nama || 'Umrah')}`)} className="flex items-center justify-center gap-3 bg-emerald-500 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider hover:bg-emerald-400 transition-all hover:-translate-y-1 shadow-xl shadow-emerald-500/30">
                <MessageCircle className="w-5 h-5" fill="currentColor" />
                AJUKAN VALIDASI VIA WA
              </button>
              
              <button onClick={onSuccess} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
                KEMBALI KE DASHBOARD
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      {currentStepName !== 'VALIDASI AKHIR' && (
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
            {isSaving ? 'MENYIMPAN...' : (currentStepName === 'PUBLIKASI & DESKRIPSI' ? 'SIMPAN & AKTIFKAN' : 'Lanjutkan')}
            {isSaving ? null : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      )}
    </div>
  );
};
