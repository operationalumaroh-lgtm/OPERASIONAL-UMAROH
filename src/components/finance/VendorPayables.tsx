import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export interface VendorInvoice {
  id: string;
  vendorName: string;
  serviceType: 'Maskapai' | 'Hotel Makkah' | 'Hotel Madinah' | 'Visa' | 'Handling' | 'Lainnya';
  paketName: string;
  amount: number;
  dueDate: string;
  status: 'Belum Bayar' | 'DP' | 'Lunas';
  notes: string;
}

export const VendorPayables: React.FC = () => {
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<VendorInvoice | null>(null);
  const [formData, setFormData] = useState<Partial<VendorInvoice>>({
    vendorName: '',
    serviceType: 'Maskapai',
    paketName: '',
    amount: 0,
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'Belum Bayar',
    notes: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('vendor_invoices');
    if (saved) {
      setInvoices(JSON.parse(saved));
    } else {
      const initial: VendorInvoice[] = [
        { id: '1', vendorName: 'Saudia Airlines', serviceType: 'Maskapai', paketName: 'Umrah Reguler 9 Hari', amount: 675000000, dueDate: '2026-05-01', status: 'Belum Bayar', notes: 'Booking 45 Seat' },
        { id: '2', vendorName: 'Emaar Andalusia', serviceType: 'Hotel Makkah', paketName: 'Umrah Reguler 9 Hari', amount: 250000000, dueDate: '2026-05-05', status: 'DP', notes: '20 Kamar Quad' },
      ];
      setInvoices(initial);
      localStorage.setItem('vendor_invoices', JSON.stringify(initial));
    }
  }, []);

  const saveInvoices = (newInvoices: VendorInvoice[]) => {
    setInvoices(newInvoices);
    localStorage.setItem('vendor_invoices', JSON.stringify(newInvoices));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInvoice) {
      const updated = invoices.map(inv => inv.id === editingInvoice.id ? { ...inv, ...formData } as VendorInvoice : inv);
      saveInvoices(updated);
    } else {
      const newInvoice: VendorInvoice = {
        ...formData,
        id: Date.now().toString(),
      } as VendorInvoice;
      saveInvoices([...invoices, newInvoice]);
    }
    setIsModalOpen(false);
    setEditingInvoice(null);
    setFormData({ vendorName: '', serviceType: 'Maskapai', paketName: '', amount: 0, dueDate: format(new Date(), 'yyyy-MM-dd'), status: 'Belum Bayar', notes: '' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus tagihan ini?')) {
      saveInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const openEdit = (inv: VendorInvoice) => {
    setEditingInvoice(inv);
    setFormData(inv);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'Lunas') return 'bg-emerald-100 text-emerald-700';
    const days = differenceInDays(parseISO(dueDate), new Date());
    if (days < 0) return 'bg-rose-100 text-rose-700 animate-pulse'; // Overdue
    if (days <= 7) return 'bg-amber-100 text-amber-700'; // Due soon
    return 'bg-blue-100 text-blue-700';
  };

  const totalHutang = invoices.filter(i => i.status !== 'Lunas').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500 rounded-lg">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tagihan Vendor (AP)</h1>
        </div>
        <button
          onClick={() => {
            setEditingInvoice(null);
            setFormData({ vendorName: '', serviceType: 'Maskapai', paketName: '', amount: 0, dueDate: format(new Date(), 'yyyy-MM-dd'), status: 'Belum Bayar', notes: '' });
            setIsModalOpen(true);
          }}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-rose-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Tagihan
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">Total Hutang Berjalan</p>
          <p className="text-3xl font-black text-rose-600">
            Rp {totalHutang.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Tagihan</p>
          <p className="text-xl font-bold text-gray-900">{invoices.length} Invoice</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Vendor & Layanan</th>
                <th className="p-4">Paket</th>
                <th className="p-4 text-right">Nominal</th>
                <th className="p-4 text-center">Jatuh Tempo</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(inv => {
                const days = differenceInDays(parseISO(inv.dueDate), new Date());
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{inv.vendorName}</p>
                      <p className="text-xs text-gray-500">{inv.serviceType}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-700">{inv.paketName}</p>
                      <p className="text-xs text-gray-400">{inv.notes}</p>
                    </td>
                    <td className="p-4 text-right font-black text-gray-900">
                      Rp {inv.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-center">
                      <p className="text-sm font-medium">{format(parseISO(inv.dueDate), 'dd MMM yyyy', { locale: idLocale })}</p>
                      {inv.status !== 'Lunas' && (
                        <p className={`text-xs font-bold ${days < 0 ? 'text-rose-600' : days <= 7 ? 'text-amber-600' : 'text-gray-400'}`}>
                          {days < 0 ? `Overdue ${Math.abs(days)} hari` : days === 0 ? 'Hari Ini' : `${days} hari lagi`}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(inv.status, inv.dueDate)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(inv)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(inv.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{editingInvoice ? 'Edit Tagihan' : 'Tambah Tagihan'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Vendor</label>
                <input type="text" required value={formData.vendorName} onChange={e => setFormData({...formData, vendorName: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Layanan</label>
                  <select value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value as any})} className="w-full p-2 border border-gray-300 rounded-lg">
                    <option value="Maskapai">Maskapai</option>
                    <option value="Hotel Makkah">Hotel Makkah</option>
                    <option value="Hotel Madinah">Hotel Madinah</option>
                    <option value="Visa">Visa</option>
                    <option value="Handling">Handling</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full p-2 border border-gray-300 rounded-lg">
                    <option value="Belum Bayar">Belum Bayar</option>
                    <option value="DP">DP</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Paket (Terkait)</label>
                <input type="text" required value={formData.paketName} onChange={e => setFormData({...formData, paketName: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                  <input type="number" required min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: parseInt(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jatuh Tempo</label>
                  <input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Misal: Booking 45 Seat" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Batal</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
