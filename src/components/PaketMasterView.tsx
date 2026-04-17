import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Maskapai } from '../data/maskapai';

import { PaketMasterWizard } from './PaketMasterWizard';

interface PaketMaster {
  id: string;
  nama: string;
  deskripsi: string;
  hargaDasar: number;
  maskapaiId: string;
  kuota: number;
  sisaKuota: number;
  status: 'draft' | 'published' | 'closed';
  createdAt?: any;
}

export const PaketMasterView: React.FC = () => {
  const [pakets, setPakets] = useState<PaketMaster[]>([]);
  const [maskapaiList, setMaskapaiList] = useState<Maskapai[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PaketMaster>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success'|'error', message: string} | null>(null);

  const showNotification = (type: 'success'|'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const unsubPaket = onSnapshot(collection(db, 'paket_master'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaketMaster));
      setPakets(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching paket_master:", error);
      setLoading(false);
    });

    const unsubMaskapai = onSnapshot(collection(db, 'maskapai'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Maskapai));
      setMaskapaiList(data);
    });

    return () => {
      unsubPaket();
      unsubMaskapai();
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'paket_master', id));
      setDeleteConfirm(null);
      showNotification('success', 'Paket berhasil dihapus');
    } catch (error) {
      console.error("Error deleting paket master:", error);
      showNotification('error', 'Gagal menghapus data paket master.');
    }
  };

  const startEdit = (paket: PaketMaster) => {
    setIsEditing(paket.id);
    setFormData(paket);
    setIsAdding(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredPakets = pakets.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMaskapaiName = (id: string) => {
    const maskapai = maskapaiList.find(m => m.id === id);
    return maskapai ? `${maskapai.name} (${maskapai.tanggalKeberangkatan})` : 'Maskapai Tidak Ditemukan';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-100 text-emerald-800';
      case 'closed': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isAdding || isEditing) {
    return (
      <div className="p-6 max-w-7xl mx-auto relative">
        <PaketMasterWizard 
          initialData={isEditing ? formData : undefined}
          onCancel={() => {
            setIsAdding(false);
            setIsEditing(null);
            setFormData({});
          }}
          onSuccess={() => {
            setIsAdding(false);
            setIsEditing(null);
            setFormData({});
            showNotification('success', 'Paket berhasil disimpan!');
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
          notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {notification.message}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            Paket Master
          </h2>
          <p className="text-gray-500 text-sm mt-1">Kelola paket umroh utama (Master) yang akan dijual melalui website atau ke Mitra.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setIsEditing(null); setFormData({ status: 'draft' }); }}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" />
          Buat Paket Program Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari paket master..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama Paket & Deskripsi</th>
                <th className="px-4 py-3 font-semibold">Maskapai & Jadwal</th>
                <th className="px-4 py-3 font-semibold text-right">Harga Dasar</th>
                <th className="px-4 py-3 font-semibold text-center">Kuota (Sisa)</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPakets.map(paket => (
                <tr key={paket.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{paket.nama}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{paket.deskripsi}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-700">{getMaskapaiName(paket.maskapaiId)}</div>
                  </td>
                  <td className="p-4 text-right font-bold text-emerald-600">
                    {formatCurrency(paket.hargaDasar)}
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-gray-900">{paket.kuota}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className={`font-bold ${paket.sisaKuota < 5 ? 'text-rose-600' : 'text-blue-600'}`}>{paket.sisaKuota}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(paket.status)}`}>
                      {paket.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {deleteConfirm === paket.id ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleDelete(paket.id)} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 font-medium">Hapus</button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-300 font-medium">Batal</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(paket)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(paket.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {pakets.length === 0 && !loading && !isAdding && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Belum ada data Paket Master. Silakan buat paket baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
