import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { PaketTracker, KeberangkatanTracker } from './types';

export const TrackerKeberangkatan: React.FC = () => {
  const [keberangkatans, setKeberangkatans] = useState<KeberangkatanTracker[]>([]);
  const [pakets, setPakets] = useState<PaketTracker[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<KeberangkatanTracker>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const unsubKeberangkatan = onSnapshot(collection(db, 'tracker_keberangkatan'), (snapshot) => {
      setKeberangkatans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KeberangkatanTracker)));
    });
    const unsubPaket = onSnapshot(collection(db, 'tracker_paket'), (snapshot) => {
      setPakets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaketTracker)));
    });
    return () => { unsubKeberangkatan(); unsubPaket(); };
  }, []);

  const handleSave = async () => {
    if (!formData.paketId || !formData.maskapai) return;
    
    try {
      const dataToSave = { ...formData };
      delete (dataToSave as any).id;
      Object.keys(dataToSave).forEach(key => (dataToSave as any)[key] === undefined && delete (dataToSave as any)[key]);

      if (isEditing) {
        await updateDoc(doc(db, 'tracker_keberangkatan', isEditing), dataToSave);
        setIsEditing(null);
      } else {
        await addDoc(collection(db, 'tracker_keberangkatan'), {
          ...dataToSave,
          statusVisa: formData.statusVisa || 'Proses',
          statusTiket: formData.statusTiket || 'Booked',
          statusHotel: formData.statusHotel || 'Pending',
        });
        setIsAdding(false);
      }
      setFormData({});
    } catch (error) {
      console.error("Error saving keberangkatan:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tracker_keberangkatan', id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting keberangkatan:", error);
    }
  };

  const startEdit = (item: KeberangkatanTracker) => {
    setIsEditing(item.id);
    setFormData(item);
    setIsAdding(false);
  };

  const getPaketName = (id: string) => pakets.find(p => p.id === id)?.namaPaket || 'Unknown Paket';

  const getBadgeColor = (status: string) => {
    if (['Selesai', 'Issued', 'Confirmed'].includes(status)) return 'bg-emerald-100 text-emerald-800';
    return 'bg-amber-100 text-amber-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Data Tracker Keberangkatan</h2>
        <button 
          onClick={() => { setIsAdding(true); setIsEditing(null); setFormData({}); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Tambah Jadwal
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="p-3 font-medium">Paket</th>
              <th className="p-3 font-medium">Penerbangan</th>
              <th className="p-3 font-medium">Visa</th>
              <th className="p-3 font-medium">Tiket</th>
              <th className="p-3 font-medium">Hotel</th>
              <th className="p-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && (
              <tr className="bg-emerald-50/50">
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.paketId || ''} onChange={e => setFormData({...formData, paketId: e.target.value})}>
                    <option value="">Pilih Paket...</option>
                    {pakets.map(p => <option key={p.id} value={p.id}>{p.namaPaket}</option>)}
                  </select>
                </td>
                <td className="p-2 space-y-1">
                  <input type="text" placeholder="Maskapai" className="w-full p-1.5 border rounded text-xs" value={formData.maskapai || ''} onChange={e => setFormData({...formData, maskapai: e.target.value})} />
                  <input type="text" placeholder="No. Flight" className="w-full p-1.5 border rounded text-xs" value={formData.nomorPenerbangan || ''} onChange={e => setFormData({...formData, nomorPenerbangan: e.target.value})} />
                  <input type="datetime-local" className="w-full p-1.5 border rounded text-xs" value={formData.waktuBerangkat || ''} onChange={e => setFormData({...formData, waktuBerangkat: e.target.value})} />
                </td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.statusVisa || 'Proses'} onChange={e => setFormData({...formData, statusVisa: e.target.value as any})}>
                    <option value="Proses">Proses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.statusTiket || 'Booked'} onChange={e => setFormData({...formData, statusTiket: e.target.value as any})}>
                    <option value="Booked">Booked</option>
                    <option value="Issued">Issued</option>
                  </select>
                </td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.statusHotel || 'Pending'} onChange={e => setFormData({...formData, statusHotel: e.target.value as any})}>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </td>
                <td className="p-2 text-right">
                  <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded mr-1"><Save className="w-4 h-4" /></button>
                  <button onClick={() => setIsAdding(false)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded"><X className="w-4 h-4" /></button>
                </td>
              </tr>
            )}
            
            {keberangkatans.map(item => isEditing === item.id ? (
              <tr key={item.id} className="bg-blue-50/50">
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.paketId || ''} onChange={e => setFormData({...formData, paketId: e.target.value})}>
                    <option value="">Pilih Paket...</option>
                    {pakets.map(p => <option key={p.id} value={p.id}>{p.namaPaket}</option>)}
                  </select>
                </td>
                <td className="p-2 space-y-1">
                  <input type="text" className="w-full p-1.5 border rounded text-xs" value={formData.maskapai || ''} onChange={e => setFormData({...formData, maskapai: e.target.value})} />
                  <input type="text" className="w-full p-1.5 border rounded text-xs" value={formData.nomorPenerbangan || ''} onChange={e => setFormData({...formData, nomorPenerbangan: e.target.value})} />
                  <input type="datetime-local" className="w-full p-1.5 border rounded text-xs" value={formData.waktuBerangkat || ''} onChange={e => setFormData({...formData, waktuBerangkat: e.target.value})} />
                </td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.statusVisa || 'Proses'} onChange={e => setFormData({...formData, statusVisa: e.target.value as any})}>
                    <option value="Proses">Proses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.statusTiket || 'Booked'} onChange={e => setFormData({...formData, statusTiket: e.target.value as any})}>
                    <option value="Booked">Booked</option>
                    <option value="Issued">Issued</option>
                  </select>
                </td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.statusHotel || 'Pending'} onChange={e => setFormData({...formData, statusHotel: e.target.value as any})}>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </td>
                <td className="p-2 text-right">
                  <button onClick={handleSave} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded mr-1"><Save className="w-4 h-4" /></button>
                  <button onClick={() => setIsEditing(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded"><X className="w-4 h-4" /></button>
                </td>
              </tr>
            ) : (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{getPaketName(item.paketId)}</td>
                <td className="p-3">
                  <div className="font-medium text-gray-900">{item.maskapai} <span className="text-gray-500 text-xs">({item.nomorPenerbangan})</span></div>
                  <div className="text-xs text-gray-500">{new Date(item.waktuBerangkat).toLocaleString('id-ID')}</div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(item.statusVisa)}`}>{item.statusVisa}</span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(item.statusTiket)}`}>{item.statusTiket}</span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(item.statusHotel)}`}>{item.statusHotel}</span>
                </td>
                <td className="p-3 text-right">
                  {deleteConfirm === item.id ? (
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => handleDelete(item.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Hapus</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300">Batal</button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => startEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-1"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            
            {keberangkatans.length === 0 && !isAdding && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">Belum ada data keberangkatan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
