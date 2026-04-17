import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, Save, X, Search, ArrowRight, Tag } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface PaketMaster {
  id: string;
  nama: string;
  deskripsi: string;
  hargaDasar: number;
  maskapaiId: string;
  kuota: number;
  sisaKuota: number;
  status: 'draft' | 'published' | 'closed';
}

interface PaketMitra {
  id: string;
  paketMasterId: string;
  mitraId: string;
  namaPaketMitra: string;
  markup: number;
  hargaJual: number;
  status: 'active' | 'inactive';
  createdAt?: any;
}

export const PaketMitraView: React.FC = () => {
  const [paketMasters, setPaketMasters] = useState<PaketMaster[]>([]);
  const [paketMitras, setPaketMitras] = useState<PaketMitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PaketMitra>>({});
  const [notification, setNotification] = useState<{type: 'success'|'error', message: string} | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const userId = auth.currentUser?.uid || 'mitra-dummy-id'; // Fallback for testing

  const showNotification = (type: 'success'|'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    // Fetch published Paket Master
    const qMaster = query(collection(db, 'paket_master'), where('status', '==', 'published'));
    const unsubMaster = onSnapshot(qMaster, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaketMaster));
      setPaketMasters(data);
    });

    // Fetch Paket Mitra for this user
    const qMitra = query(collection(db, 'paket_mitra'), where('mitraId', '==', userId));
    const unsubMitra = onSnapshot(qMitra, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaketMitra));
      setPaketMitras(data);
      setLoading(false);
    });

    return () => {
      unsubMaster();
      unsubMitra();
    };
  }, [userId]);

  const handleSave = async () => {
    if (!formData.paketMasterId || !formData.namaPaketMitra || formData.markup === undefined) {
      showNotification('error', 'Mohon lengkapi data wajib (Paket Master, Nama Paket, Markup)');
      return;
    }

    const master = paketMasters.find(m => m.id === formData.paketMasterId);
    if (!master) return;

    const hargaJual = master.hargaDasar + Number(formData.markup);

    try {
      const dataToSave = {
        paketMasterId: formData.paketMasterId,
        mitraId: userId,
        namaPaketMitra: formData.namaPaketMitra,
        markup: Number(formData.markup),
        hargaJual: hargaJual,
        status: formData.status || 'active',
      };

      if (isEditing) {
        await updateDoc(doc(db, 'paket_mitra', isEditing), dataToSave);
        setIsEditing(null);
        showNotification('success', 'Paket Mitra berhasil diperbarui');
      } else {
        await addDoc(collection(db, 'paket_mitra'), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        setIsAdding(false);
        showNotification('success', 'Paket Mitra berhasil ditambahkan');
      }
      setFormData({});
    } catch (error) {
      console.error("Error saving paket mitra:", error);
      showNotification('error', 'Gagal menyimpan data paket mitra.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'paket_mitra', id));
      setDeleteConfirm(null);
      showNotification('success', 'Paket Mitra berhasil dihapus');
    } catch (error) {
      console.error("Error deleting paket mitra:", error);
      showNotification('error', 'Gagal menghapus data paket mitra.');
    }
  };

  const startEdit = (paket: PaketMitra) => {
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

  const filteredPaketMitras = paketMitras.filter(p => 
    p.namaPaketMitra.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
          notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            Kelola Paket Mitra
          </h2>
          <p className="text-gray-500 text-sm mt-1">Buat paket jualan Anda dengan melakukan markup dari Paket Master.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setIsEditing(null); setFormData({ status: 'active', markup: 0 }); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors text-sm font-bold"
        >
          <Plus className="w-4 h-4" />
          Buat Paket Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari paket Anda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama Paket Anda</th>
                <th className="px-4 py-3 font-semibold">Sumber Paket Master</th>
                <th className="px-4 py-3 font-semibold text-right">Harga Dasar</th>
                <th className="px-4 py-3 font-semibold text-right">Markup (Komisi)</th>
                <th className="px-4 py-3 font-semibold text-right">Harga Jual</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isAdding && (
                <tr className="bg-indigo-50/50">
                  <td className="p-3">
                    <input type="text" placeholder="Nama Paket Jualan Anda" className="w-full p-2 border rounded text-sm" value={formData.namaPaketMitra || ''} onChange={e => setFormData({...formData, namaPaketMitra: e.target.value})} />
                  </td>
                  <td className="p-3">
                    <select className="w-full p-2 border rounded text-sm" value={formData.paketMasterId || ''} onChange={e => setFormData({...formData, paketMasterId: e.target.value})}>
                      <option value="">-- Pilih Paket Master --</option>
                      {paketMasters.map(m => (
                        <option key={m.id} value={m.id}>{m.nama} - {formatCurrency(m.hargaDasar)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-right text-gray-500 font-medium">
                    {formData.paketMasterId ? formatCurrency(paketMasters.find(m => m.id === formData.paketMasterId)?.hargaDasar || 0) : '-'}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-gray-500">+</span>
                      <input type="number" placeholder="Markup" className="w-32 p-2 border rounded text-sm text-right" value={formData.markup || ''} onChange={e => setFormData({...formData, markup: Number(e.target.value)})} />
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-indigo-600">
                    {formData.paketMasterId ? formatCurrency((paketMasters.find(m => m.id === formData.paketMasterId)?.hargaDasar || 0) + Number(formData.markup || 0)) : '-'}
                  </td>
                  <td className="p-3">
                    <select className="w-full p-2 border rounded text-sm" value={formData.status || 'active'} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={handleSave} className="p-2 bg-emerald-600 text-white rounded hover:bg-emerald-700" title="Simpan"><Save className="w-4 h-4" /></button>
                      <button onClick={() => setIsAdding(false)} className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" title="Batal"><X className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )}

              {filteredPaketMitras.map(paket => {
                const master = paketMasters.find(m => m.id === paket.paketMasterId);
                
                if (isEditing === paket.id) {
                  return (
                    <tr key={paket.id} className="bg-blue-50/50">
                      <td className="p-3">
                        <input type="text" className="w-full p-2 border rounded text-sm" value={formData.namaPaketMitra || ''} onChange={e => setFormData({...formData, namaPaketMitra: e.target.value})} />
                      </td>
                      <td className="p-3">
                        <select className="w-full p-2 border rounded text-sm" value={formData.paketMasterId || ''} onChange={e => setFormData({...formData, paketMasterId: e.target.value})}>
                          <option value="">-- Pilih Paket Master --</option>
                          {paketMasters.map(m => (
                            <option key={m.id} value={m.id}>{m.nama} - {formatCurrency(m.hargaDasar)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-right text-gray-500 font-medium">
                        {formData.paketMasterId ? formatCurrency(paketMasters.find(m => m.id === formData.paketMasterId)?.hargaDasar || 0) : '-'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-gray-500">+</span>
                          <input type="number" className="w-32 p-2 border rounded text-sm text-right" value={formData.markup || ''} onChange={e => setFormData({...formData, markup: Number(e.target.value)})} />
                        </div>
                      </td>
                      <td className="p-3 text-right font-bold text-indigo-600">
                        {formData.paketMasterId ? formatCurrency((paketMasters.find(m => m.id === formData.paketMasterId)?.hargaDasar || 0) + Number(formData.markup || 0)) : '-'}
                      </td>
                      <td className="p-3">
                        <select className="w-full p-2 border rounded text-sm" value={formData.status || 'active'} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={handleSave} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700" title="Simpan"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setIsEditing(null)} className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" title="Batal"><X className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={paket.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{paket.namaPaketMitra}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-700">{master?.nama || 'Master Tidak Ditemukan'}</div>
                      {master && <div className="text-xs text-gray-500 mt-1">Sisa Kuota: {master.sisaKuota}</div>}
                    </td>
                    <td className="p-4 text-right font-medium text-gray-600">
                      {master ? formatCurrency(master.hargaDasar) : '-'}
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600">
                      + {formatCurrency(paket.markup)}
                    </td>
                    <td className="p-4 text-right font-black text-indigo-700">
                      {formatCurrency(paket.hargaJual)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${paket.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
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
                );
              })}

              {paketMitras.length === 0 && !loading && !isAdding && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Belum ada Paket Mitra. Silakan buat paket baru dengan melakukan markup dari Paket Master.
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
