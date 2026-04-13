import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, db } from '../../firebase';
import { Plus, Edit2, Trash2, Save, X, FileText } from 'lucide-react';
import { PaketTracker, JamaahTracker } from './types';
import { handleFirestoreError, OperationType } from '../../utils/firestoreErrorHandler';

export const TrackerJamaah: React.FC = () => {
  const [jamaahs, setJamaahs] = useState<JamaahTracker[]>([]);
  const [pakets, setPakets] = useState<PaketTracker[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<JamaahTracker>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Manifest Modal State
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
  const [manifestData, setManifestData] = useState<Partial<JamaahTracker>>({});
  const [manifestJamaahId, setManifestJamaahId] = useState<string | null>(null);

  useEffect(() => {
    const unsubJamaah = onSnapshot(collection(db, 'tracker_jamaah'), (snapshot) => {
      setJamaahs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JamaahTracker)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tracker_jamaah');
    });
    const unsubPaket = onSnapshot(collection(db, 'tracker_paket'), (snapshot) => {
      setPakets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaketTracker)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tracker_paket');
    });
    return () => { unsubJamaah(); unsubPaket(); };
  }, []);

  const handleSave = async () => {
    if (!formData.namaLengkap || !formData.paketId) return;
    
    try {
      const dataToSave = { ...formData };
      delete (dataToSave as any).id;
      Object.keys(dataToSave).forEach(key => (dataToSave as any)[key] === undefined && delete (dataToSave as any)[key]);

      if (isEditing) {
        await updateDoc(doc(db, 'tracker_jamaah', isEditing), dataToSave);
        setIsEditing(null);
      } else {
        await addDoc(collection(db, 'tracker_jamaah'), {
          ...dataToSave,
          statusPembayaran: formData.statusPembayaran || 'Belum Bayar',
          statusPaspor: formData.statusPaspor || 'Belum Ada',
          statusVaksin: formData.statusVaksin || 'Belum',
          status_kesiapan: 'NOT_READY'
        });
        setIsAdding(false);
      }
      setFormData({});
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'tracker_jamaah');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tracker_jamaah', id));
      setDeleteConfirm(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'tracker_jamaah');
    }
  };

  const startEdit = (jamaah: JamaahTracker) => {
    setIsEditing(jamaah.id);
    setFormData(jamaah);
    setIsAdding(false);
  };

  const openManifestModal = (jamaah: JamaahTracker) => {
    setManifestJamaahId(jamaah.id);
    setManifestData(jamaah);
    setIsManifestModalOpen(true);
  };

  const saveManifestData = async () => {
    if (!manifestJamaahId) return;
    try {
      const dataToSave = { ...manifestData };
      delete (dataToSave as any).id;
      Object.keys(dataToSave).forEach(key => (dataToSave as any)[key] === undefined && delete (dataToSave as any)[key]);
      
      await updateDoc(doc(db, 'tracker_jamaah', manifestJamaahId), dataToSave);
      setIsManifestModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'tracker_jamaah');
    }
  };

  const getPaketName = (id: string) => pakets.find(p => p.id === id)?.namaPaket || 'Unknown Paket';

  const getBadgeColor = (status: string) => {
    if (['Lunas', 'Sudah Ada', 'Sudah', 'READY'].includes(status)) return 'bg-emerald-100 text-emerald-800';
    if (['DP', 'Dalam Proses'].includes(status)) return 'bg-amber-100 text-amber-800';
    return 'bg-rose-100 text-rose-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Data Tracker Jamaah</h2>
        <button 
          onClick={() => { setIsAdding(true); setIsEditing(null); setFormData({}); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Tambah Jamaah
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="p-3 font-medium">Nama Lengkap / NIK</th>
              <th className="p-3 font-medium">Paket Keberangkatan</th>
              <th className="p-3 font-medium">Status Kesiapan</th>
              <th className="p-3 font-medium">Pembayaran</th>
              <th className="p-3 font-medium">Paspor</th>
              <th className="p-3 font-medium">Vaksin</th>
              <th className="p-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && (
              <tr className="bg-emerald-50/50">
                <td className="p-2 space-y-1">
                  <input type="text" placeholder="Nama Lengkap" className="w-full p-1.5 border rounded text-xs" value={formData.namaLengkap || ''} onChange={e => setFormData({...formData, namaLengkap: e.target.value})} />
                  <input type="text" placeholder="NIK" className="w-full p-1.5 border rounded text-xs" value={formData.nik || ''} onChange={e => setFormData({...formData, nik: e.target.value})} />
                </td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.paketId || ''} onChange={e => setFormData({...formData, paketId: e.target.value})}>
                    <option value="">Pilih Paket...</option>
                    {pakets.map(p => <option key={p.id} value={p.id}>{p.namaPaket}</option>)}
                  </select>
                </td>
                <td className="p-2 text-gray-400 text-xs italic">NOT_READY</td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.statusPembayaran || 'Belum Bayar'} onChange={e => setFormData({...formData, statusPembayaran: e.target.value as any})}>
                    <option value="Belum Bayar">Belum Bayar</option>
                    <option value="DP">DP</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.statusPaspor || 'Belum Ada'} onChange={e => setFormData({...formData, statusPaspor: e.target.value as any})}>
                    <option value="Belum Ada">Belum Ada</option>
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Sudah Ada">Sudah Ada</option>
                  </select>
                </td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.statusVaksin || 'Belum'} onChange={e => setFormData({...formData, statusVaksin: e.target.value as any})}>
                    <option value="Belum">Belum</option>
                    <option value="Sudah">Sudah</option>
                  </select>
                </td>
                <td className="p-2 text-right">
                  <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded mr-1"><Save className="w-4 h-4" /></button>
                  <button onClick={() => setIsAdding(false)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded"><X className="w-4 h-4" /></button>
                </td>
              </tr>
            )}
            
            {jamaahs.map(jamaah => isEditing === jamaah.id ? (
              <tr key={jamaah.id} className="bg-blue-50/50">
                <td className="p-2 space-y-1">
                  <input type="text" className="w-full p-1.5 border rounded text-xs" value={formData.namaLengkap || ''} onChange={e => setFormData({...formData, namaLengkap: e.target.value})} />
                  <input type="text" className="w-full p-1.5 border rounded text-xs" value={formData.nik || ''} onChange={e => setFormData({...formData, nik: e.target.value})} />
                </td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.paketId || ''} onChange={e => setFormData({...formData, paketId: e.target.value})}>
                    <option value="">Pilih Paket...</option>
                    {pakets.map(p => <option key={p.id} value={p.id}>{p.namaPaket}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.status_kesiapan || 'NOT_READY'} onChange={e => setFormData({...formData, status_kesiapan: e.target.value as any})}>
                    <option value="NOT_READY">NOT_READY</option>
                    <option value="READY">READY</option>
                  </select>
                </td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.statusPembayaran || 'Belum Bayar'} onChange={e => setFormData({...formData, statusPembayaran: e.target.value as any})}>
                    <option value="Belum Bayar">Belum Bayar</option>
                    <option value="DP">DP</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.statusPaspor || 'Belum Ada'} onChange={e => setFormData({...formData, statusPaspor: e.target.value as any})}>
                    <option value="Belum Ada">Belum Ada</option>
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Sudah Ada">Sudah Ada</option>
                  </select>
                </td>
                <td className="p-2">
                  <select className="w-full p-1.5 border rounded text-xs" value={formData.statusVaksin || 'Belum'} onChange={e => setFormData({...formData, statusVaksin: e.target.value as any})}>
                    <option value="Belum">Belum</option>
                    <option value="Sudah">Sudah</option>
                  </select>
                </td>
                <td className="p-2 text-right">
                  <button onClick={handleSave} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded mr-1"><Save className="w-4 h-4" /></button>
                  <button onClick={() => setIsEditing(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded"><X className="w-4 h-4" /></button>
                </td>
              </tr>
            ) : (
              <tr key={jamaah.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-medium text-gray-900">{jamaah.namaLengkap}</div>
                  <div className="text-xs text-gray-500">{jamaah.nik}</div>
                </td>
                <td className="p-3 text-gray-600">{getPaketName(jamaah.paketId)}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(jamaah.status_kesiapan || 'NOT_READY')}`}>{jamaah.status_kesiapan || 'NOT_READY'}</span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(jamaah.statusPembayaran)}`}>{jamaah.statusPembayaran}</span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(jamaah.statusPaspor)}`}>{jamaah.statusPaspor}</span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(jamaah.statusVaksin)}`}>{jamaah.statusVaksin}</span>
                </td>
                <td className="p-3 text-right">
                  {deleteConfirm === jamaah.id ? (
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => handleDelete(jamaah.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Hapus</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300">Batal</button>
                    </div>
                  ) : (
                    <div className="flex justify-end items-center">
                      <button onClick={() => openManifestModal(jamaah)} title="Data Manifest" className="p-1.5 text-purple-600 hover:bg-purple-50 rounded mr-1"><FileText className="w-4 h-4" /></button>
                      <button onClick={() => startEdit(jamaah)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-1"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirm(jamaah.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            
            {jamaahs.length === 0 && !isAdding && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">Belum ada data jamaah.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Manifest Data Modal */}
      {isManifestModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">Data Manifest Jamaah</h3>
              <button onClick={() => setIsManifestModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <select 
                    className="w-full p-2 border rounded-lg text-sm"
                    value={manifestData.title || ''}
                    onChange={e => setManifestData({...manifestData, title: e.target.value})}
                  >
                    <option value="">Pilih Title...</option>
                    <option value="MR">MR</option>
                    <option value="MRS">MRS</option>
                    <option value="MS">MS</option>
                    <option value="MSTR">MSTR</option>
                    <option value="MISS">MISS</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama di Paspor</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-lg text-sm uppercase"
                    value={manifestData.nama_paspor || ''}
                    onChange={e => setManifestData({...manifestData, nama_paspor: e.target.value.toUpperCase()})}
                    placeholder="Sesuai Paspor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No Paspor</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-lg text-sm uppercase"
                    value={manifestData.no_paspor || ''}
                    onChange={e => setManifestData({...manifestData, no_paspor: e.target.value.toUpperCase()})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kota Dikeluarkan</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-lg text-sm"
                    value={manifestData.kota_paspor || ''}
                    onChange={e => setManifestData({...manifestData, kota_paspor: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Dikeluarkan (Issue)</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border rounded-lg text-sm"
                    value={manifestData.tgl_issue_paspor || ''}
                    onChange={e => setManifestData({...manifestData, tgl_issue_paspor: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Kadaluarsa (Expired)</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border rounded-lg text-sm"
                    value={manifestData.tgl_exp_paspor || ''}
                    onChange={e => setManifestData({...manifestData, tgl_exp_paspor: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-lg text-sm"
                    value={manifestData.tempat_lahir || ''}
                    onChange={e => setManifestData({...manifestData, tempat_lahir: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border rounded-lg text-sm"
                    value={manifestData.tanggal_lahir || ''}
                    onChange={e => setManifestData({...manifestData, tanggal_lahir: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kewarganegaraan</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-lg text-sm"
                    value={manifestData.kewarganegaraan || 'INDONESIA'}
                    onChange={e => setManifestData({...manifestData, kewarganegaraan: e.target.value.toUpperCase()})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Kesiapan</label>
                  <select 
                    className="w-full p-2 border rounded-lg text-sm font-medium"
                    value={manifestData.status_kesiapan || 'NOT_READY'}
                    onChange={e => setManifestData({...manifestData, status_kesiapan: e.target.value as any})}
                  >
                    <option value="NOT_READY">NOT_READY</option>
                    <option value="READY">READY</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button 
                onClick={() => setIsManifestModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Batal
              </button>
              <button 
                onClick={saveManifestData}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Simpan Data Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
