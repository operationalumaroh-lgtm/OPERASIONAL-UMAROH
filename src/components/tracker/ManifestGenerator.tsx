import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { PaketTracker, JamaahTracker, KeberangkatanTracker } from './types';
import * as XLSX from 'xlsx';

interface Props {
  paket: PaketTracker;
  jamaahs: JamaahTracker[];
  keberangkatan?: KeberangkatanTracker;
}

export const ManifestGenerator: React.FC<Props> = ({ paket, jamaahs, keberangkatan }) => {
  
  const handleDownloadExcel = () => {
    // Prepare Data for Excel
    const dataToExport = jamaahs.map((j, index) => ({
      'No': index + 1,
      'Title': j.title || '',
      'Nama Sesuai Paspor': j.nama_paspor || j.namaLengkap,
      'No. Paspor': j.no_paspor || '',
      'Tgl Issue': j.tgl_issue_paspor || '',
      'Tgl Expired': j.tgl_exp_paspor || '',
      'Tempat Lahir': j.tempat_lahir || '',
      'Tanggal Lahir': j.tanggal_lahir || '',
      'Jenis Kelamin': j.jenisKelamin === 'L' ? 'Laki-laki' : j.jenisKelamin === 'P' ? 'Perempuan' : '',
      'Kewarganegaraan': j.kewarganegaraan || 'Indonesia',
      'NIK': j.nik || '',
      'Tipe Kamar': j.roomType || '',
      'No. Kamar': j.roomNumber || '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Auto-size columns
    const colWidths = [
      { wch: 5 }, // No
      { wch: 10 }, // Title
      { wch: 30 }, // Nama
      { wch: 15 }, // No Paspor
      { wch: 15 }, // Tgl Issue
      { wch: 15 }, // Tgl Exp
      { wch: 20 }, // Tempat Lahir
      { wch: 15 }, // Tgl Lahir
      { wch: 15 }, // JK
      { wch: 15 }, // Kewarganegaraan
      { wch: 20 }, // NIK
      { wch: 15 }, // Tipe Kamar
      { wch: 15 }, // No Kamar
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Manifest Jamaah');

    // Add Flight Info Sheet if available
    if (keberangkatan) {
      const flightData = [
        { Keterangan: 'Nama Paket', Nilai: paket.namaPaket },
        { Keterangan: 'Maskapai', Nilai: keberangkatan.maskapai },
        { Keterangan: 'No. Penerbangan', Nilai: keberangkatan.nomorPenerbangan },
        { Keterangan: 'Kode Booking (PNR)', Nilai: keberangkatan.kodeBooking || '-' },
        { Keterangan: 'Rute', Nilai: keberangkatan.rute || '-' },
        { Keterangan: 'Waktu Berangkat', Nilai: keberangkatan.waktuBerangkat ? new Date(keberangkatan.waktuBerangkat).toLocaleString('id-ID') : '-' },
        { Keterangan: 'Waktu Tiba', Nilai: keberangkatan.waktuTiba ? new Date(keberangkatan.waktuTiba).toLocaleString('id-ID') : '-' },
        { Keterangan: 'Tour Leader', Nilai: keberangkatan.tourLeader || '-' },
        { Keterangan: 'Mutawwif', Nilai: keberangkatan.mutawwif || '-' },
      ];
      const wsFlight = XLSX.utils.json_to_sheet(flightData);
      wsFlight['!cols'] = [{ wch: 25 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, wsFlight, 'Info Keberangkatan');
    }

    XLSX.writeFile(wb, `Manifest_${paket.namaPaket.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-green-600" />
          Generate Manifest Resmi
        </h3>
        <button
          onClick={handleDownloadExcel}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download Excel Manifest
        </button>
      </div>
      <div className="p-4 bg-white">
        <p className="text-sm text-gray-600">
          Manifest ini akan menggabungkan data jamaah (termasuk detail paspor), pembagian kamar (Rooming List), dan data penerbangan (jika sudah diisi di Tracker Keberangkatan). File Excel ini siap diserahkan ke maskapai atau provider visa.
        </p>
      </div>
    </div>
  );
};
