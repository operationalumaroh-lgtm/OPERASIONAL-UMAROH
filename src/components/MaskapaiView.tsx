import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, PlaneTakeoff } from 'lucide-react';
import { Maskapai, maskapaiData as initialData } from '../data/maskapai';

export const MaskapaiView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<Maskapai[]>(() => {
    const currentYear = new Date().getFullYear();
    return initialData.filter(item => {
      const itemYear = new Date(item.tanggalKeberangkatan).getFullYear();
      const isOldYear = itemYear < currentYear;
      const isLowSeat = item.availableSeats < 10;
      
      // Hanya simpan data yang tahunnya >= tahun ini DAN sisa seat >= 10
      return !isOldYear && !isLowSeat;
    });
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tanggalKeberangkatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tanggalKepulangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.namaVendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.originCityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.destinationCityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PlaneTakeoff className="w-6 h-6 text-emerald-600" />
            Database Maskapai
          </h2>
          <p className="text-gray-500 text-sm mt-1">Kelola data harga tiket pesawat dan rute</p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" />
          Tambah Maskapai
        </button>
      </div>

      {/* Info Panel */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-yellow-800 mb-2">Asumsi Dasar Margin:</p>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              <li>Indigo: 2%</li>
              <li>Hainan: 2%</li>
              <li>Pesawat di bawah 15jt: 2%</li>
              <li>Pesawat di atas 15jt: 1%</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-yellow-800 mb-2">Catatan:</p>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              <li>Keuntungan base on persentase</li>
              <li>Data by actual vendor</li>
              <li>Update berkala setiap vendor berikan harga</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari maskapai, rute, atau periode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold">Maskapai & Rute</th>
                <th className="px-4 py-3 font-semibold text-center">Seats</th>
                <th className="px-4 py-3 font-semibold">Harga Jual</th>
                <th className="px-4 py-3 font-semibold">Harga Beli</th>
                <th className="px-4 py-3 font-semibold">Margin</th>
                <th className="px-4 py-3 font-semibold">Persen</th>
                <th className="px-4 py-3 font-semibold">Program Days</th>
                <th className="px-4 py-3 font-semibold">Tgl Berangkat</th>
                <th className="px-4 py-3 font-semibold">Tgl Pulang</th>
                <th className="px-4 py-3 font-semibold">Vendor</th>
                <th className="px-4 py-3 font-semibold">Origin City</th>
                <th className="px-4 py-3 font-semibold">Destination City</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.availableSeats === 0 ? 'bg-red-100 text-red-700' :
                        item.availableSeats <= 5 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.availableSeats} / {item.totalSeats}
                      </span>
                      <div className="w-16 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full ${
                            item.availableSeats === 0 ? 'bg-red-500' :
                            item.availableSeats <= 5 ? 'bg-orange-500' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${(item.availableSeats / item.totalSeats) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">{formatCurrency(item.hargaJual)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatCurrency(item.hargaBeli)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatCurrency(item.margin)}</td>
                  <td className="px-4 py-3">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-medium">
                      {item.persen}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{item.programDays}</td>
                  <td className="px-4 py-3 text-gray-600">{item.tanggalKeberangkatan}</td>
                  <td className="px-4 py-3 text-gray-600">{item.tanggalKepulangan}</td>
                  <td className="px-4 py-3 text-gray-600">{item.namaVendor}</td>
                  <td className="px-4 py-3 text-gray-600">{item.originCityName}</td>
                  <td className="px-4 py-3 text-gray-600">{item.destinationCityName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data maskapai yang ditemukan.
            </div>
          )}
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="xl:hidden divide-y divide-gray-100">
          {filteredData.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span className="font-medium text-emerald-600">{item.originCityName}</span>
                    <span>→</span>
                    <span className="font-medium text-emerald-600">{item.destinationCityName}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    item.availableSeats === 0 ? 'bg-red-100 text-red-700' :
                    item.availableSeats <= 5 ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {item.availableSeats} / {item.totalSeats} Seats
                  </span>
                  <div className="text-emerald-600 font-bold mt-1">
                    {formatCurrency(item.hargaJual)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-4">
                <div>
                  <div className="text-gray-500 text-xs uppercase font-semibold">Tgl Berangkat</div>
                  <div className="text-gray-900">{item.tanggalKeberangkatan}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase font-semibold">Tgl Pulang</div>
                  <div className="text-gray-900">{item.tanggalKepulangan}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase font-semibold">Vendor</div>
                  <div className="text-gray-900">{item.namaVendor}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase font-semibold">Program</div>
                  <div className="text-gray-900">{item.programDays} Days</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase font-semibold">Harga Beli</div>
                  <div className="text-gray-700">{formatCurrency(item.hargaBeli)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase font-semibold">Margin</div>
                  <div className="text-emerald-700 font-medium">{formatCurrency(item.margin)} ({item.persen}%)</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-50">
                <button className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data maskapai yang ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
