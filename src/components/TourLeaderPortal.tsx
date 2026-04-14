import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { KeberangkatanTracker, PaketTracker, JamaahTracker } from './tracker/types';
import { MapPin, Users, CheckCircle, Clock } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export const TourLeaderPortal: React.FC = () => {
  const [keberangkatans, setKeberangkatans] = useState<KeberangkatanTracker[]>([]);
  const [pakets, setPakets] = useState<PaketTracker[]>([]);
  const [jamaahs, setJamaahs] = useState<JamaahTracker[]>([]);
  const [selectedKeberangkatan, setSelectedKeberangkatan] = useState<KeberangkatanTracker | null>(null);

  useEffect(() => {
    // In a real app, we would filter by the logged-in TL's ID/Name.
    // For now, we fetch all and let them select.
    const unsubKeberangkatan = onSnapshot(collection(db, 'tracker_keberangkatan'), (snapshot) => {
      setKeberangkatans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KeberangkatanTracker)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tracker_keberangkatan');
    });
    const unsubPaket = onSnapshot(collection(db, 'tracker_paket'), (snapshot) => {
      setPakets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaketTracker)));
    });
    const unsubJamaah = onSnapshot(collection(db, 'tracker_jamaah'), (snapshot) => {
      setJamaahs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JamaahTracker)));
    });

    return () => { unsubKeberangkatan(); unsubPaket(); unsubJamaah(); };
  }, []);

  const getPaketName = (id: string) => pakets.find(p => p.id === id)?.namaPaket || 'Unknown Paket';

  const handleUpdateStatus = async (jamaahId: string, status: 'READY' | 'NOT_READY') => {
    try {
      await updateDoc(doc(db, 'tracker_jamaah', jamaahId), { status_kesiapan: status });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'tracker_jamaah');
    }
  };

  const handleUpdateLocation = async () => {
    if (!selectedKeberangkatan) return;
    
    // Simulate getting location
    const lat = 21.4225 + (Math.random() - 0.5) * 0.01; // Near Mecca
    const lng = 39.8262 + (Math.random() - 0.5) * 0.01;

    try {
      const groupId = `group_${selectedKeberangkatan.paketId}`;
      
      await setDoc(doc(db, 'tracking_group', groupId), {
        paket_id: selectedKeberangkatan.paketId,
        nama_group: `Rombongan ${getPaketName(selectedKeberangkatan.paketId)}`,
        leader_id: selectedKeberangkatan.tourLeader || 'TL',
        status: 'di_mekkah',
        last_location: {
          lat,
          lng,
          updated_at: new Date().toISOString()
        }
      }, { merge: true });
      
      alert("Lokasi berhasil diupdate! (Simulasi)");
    } catch (error) {
      console.error(error);
      alert("Gagal update lokasi.");
    }
  };

  if (!selectedKeberangkatan) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Portal Tour Leader</h2>
        <p className="text-gray-600 text-sm">Pilih jadwal keberangkatan yang Anda pandu:</p>
        
        <div className="space-y-3">
          {keberangkatans.map(k => (
            <div 
              key={k.id} 
              onClick={() => setSelectedKeberangkatan(k)}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:border-emerald-500 transition-colors"
            >
              <div className="font-semibold text-gray-900">{getPaketName(k.paketId)}</div>
              <div className="text-sm text-gray-500 mt-1">🛫 {new Date(k.waktuBerangkat).toLocaleDateString('id-ID')}</div>
              <div className="text-xs text-emerald-600 mt-2 font-medium">TL: {k.tourLeader || 'Belum Ditentukan'}</div>
            </div>
          ))}
          {keberangkatans.length === 0 && (
            <div className="text-center text-gray-500 p-8">Belum ada jadwal keberangkatan.</div>
          )}
        </div>
      </div>
    );
  }

  const paketJamaahs = jamaahs.filter(j => j.paketId === selectedKeberangkatan.paketId);
  const readyCount = paketJamaahs.filter(j => j.status_kesiapan === 'READY').length;

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20">
      <div className="bg-emerald-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <button onClick={() => setSelectedKeberangkatan(null)} className="text-emerald-100 text-sm mb-2">← Kembali</button>
        <h2 className="text-lg font-bold">{getPaketName(selectedKeberangkatan.paketId)}</h2>
        <div className="text-sm opacity-90 mt-1">🛫 {new Date(selectedKeberangkatan.waktuBerangkat).toLocaleDateString('id-ID')}</div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleUpdateLocation} className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-2 text-blue-600 hover:bg-blue-50">
            <MapPin className="w-6 h-6" />
            <span className="text-xs font-medium">Update Lokasi</span>
          </button>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-2 text-emerald-600">
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">{readyCount} / {paketJamaahs.length} Hadir</span>
          </div>
        </div>

        {/* Jamaah List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 font-medium text-gray-700 text-sm">
            Absensi Jamaah
          </div>
          <div className="divide-y divide-gray-100">
            {paketJamaahs.map(jamaah => (
              <div key={jamaah.id} className="p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{jamaah.namaLengkap}</div>
                  <div className="text-xs text-gray-500">Kamar: {jamaah.roomNumber || '-'}</div>
                </div>
                <button
                  onClick={() => handleUpdateStatus(jamaah.id, jamaah.status_kesiapan === 'READY' ? 'NOT_READY' : 'READY')}
                  className={`p-2 rounded-full transition-colors ${jamaah.status_kesiapan === 'READY' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
            {paketJamaahs.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">Belum ada jamaah di paket ini.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
