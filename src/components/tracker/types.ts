export interface Timeline {
  dp?: string;
  pelunasan?: string;
  dokumen?: string;
  visa?: string;
  tiket?: string;
  berangkat?: string;
}

export interface PaketTracker {
  id: string;
  namaPaket: string;
  tanggalBerangkat: string;
  status: 'Persiapan' | 'Booking Seat' | 'Proses Visa' | 'Siap Berangkat' | 'Selesai';
  targetJamaah: number;
  terdaftar: number;
  timeline_estimasi?: Timeline;
  timeline_actual?: Timeline;
}

export interface TrackingGroup {
  id: string;
  paket_id: string;
  nama_group: string;
  leader_id: string;
  status: 'persiapan' | 'berangkat' | 'di_madinah' | 'di_mekkah' | 'pulang' | 'selesai';
  last_location?: {
    lat: number;
    lng: number;
    updated_at: string;
  };
}

export interface JamaahTracker {
  id: string;
  namaLengkap: string;
  nik: string;
  paketId: string;
  statusPembayaran: 'Belum Bayar' | 'DP' | 'Lunas';
  statusPaspor: 'Belum Ada' | 'Dalam Proses' | 'Sudah Ada';
  statusVaksin: 'Belum' | 'Sudah';
  
  // Manifest fields
  title?: string;
  nama_paspor?: string;
  no_paspor?: string;
  tgl_issue_paspor?: string;
  tgl_exp_paspor?: string;
  kota_paspor?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  kewarganegaraan?: string;
  status_kesiapan?: 'READY' | 'NOT_READY';
}

export interface KeberangkatanTracker {
  id: string;
  paketId: string;
  maskapai: string;
  nomorPenerbangan: string;
  waktuBerangkat: string;
  statusVisa: 'Proses' | 'Selesai';
  statusTiket: 'Booked' | 'Issued';
  statusHotel: 'Pending' | 'Confirmed';
}
