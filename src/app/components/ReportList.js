import React from 'react';

const ReportList = ({ currentUser }) => {
  // Data Laporan Resmi (1 Transaksi Besar)
  const reportData = {
    id: 'LAP-2024-BCA-001',
    date: new Date('2024-01-22T09:00:00'),
    subject: 'Bayu Pratama',
    accountNumber: '8820-1234-56',
    amount: 57000000,
    description: 'Indikasi Pengalihan Dana & Pelanggaran Aset Perusahaan',
    recipient: 'Rekening Tak Dikenal (Unknown Beneficiary)',
    reference: 'TRX-9988-BCA-PENYALAHGUNAAN',
    status: 'DIPROSES UNTUK PENYIDIKAN',
    severity: 'HIGH' // Tinggi
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header Dokumen Resmi */}
      <div className="bg-white border-b-4 border-gray-800 pb-6 mb-8 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
              Laporan Resmi Transaksi
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">
              Nomor: <span className="font-bold text-gray-700">{reportData.id}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-300 mb-2">
              {/* Placeholder Logo BCA */}
              <span className="text-blue-700 font-bold text-xs text-center leading-tight">BCA<br/>LEGAL</span>
            </div>
            <p className="text-xs text-gray-500 uppercase">Bank Central Asia</p>
            <p className="text-xs text-gray-500">Divisi Investigasi & Aset</p>
          </div>
        </div>
      </div>

      {/* Konten Utama Dokumen */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
        
        {/* Banner Peringatan */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-sm font-bold text-red-800 uppercase">
                Peringatan: Pelanggaran Berat & Pengalihan Dana
              </h3>
              <p className="text-xs text-red-600 mt-1">
                Transaksi ini telah diverifikasi sebagai indikasi penggelapan dana perusahaan.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Kolom Kiri: Data Subjek */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-1">Data Subjek</h4>
              <div>
                <p className="text-xs text-gray-500">Nama Pemilik Rekening</p>
                <p className="font-semibold text-gray-900 text-lg">{reportData.subject}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Nomor Rekening</p>
                <p className="font-mono font-bold text-gray-800">{reportData.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status Rekening</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  DIBEKUKAN
                </span>
              </div>
            </div>

            {/* Kolom Kanan: Detail Transaksi */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-1">Detail Transaksi</h4>
              <div>
                <p className="text-xs text-gray-500">Tanggal & Waktu</p>
                <p className="font-medium text-gray-800">{formatDate(reportData.date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Nominal Transaksi</p>
                <p className="text-2xl font-extrabold text-red-600">{formatRupiah(reportData.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tujuan Transfer</p>
                <p className="font-medium text-gray-900">{reportData.recipient}</p>
              </div>
            </div>
          </div>

          {/* Deskripsi Kasus */}
          <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200">
            <h4 className="text-sm font-bold text-gray-700 mb-2">Deskripsi Pelanggaran:</h4>
            <p className="text-sm text-gray-800 leading-relaxed">
              {reportData.description}. Transaksi dilakukan pada {formatDate(reportData.date)} dengan nomor referensi <span className="font-mono text-red-600 font-bold">{reportData.reference}</span>. 
              Dana telah dialihkan ke rekening pihak ketiga yang tidak terkait dengan entitas legal perusahaan. 
              Indikasi kuat dilakukan penggelapan aset perusahaan sebesar {formatRupiah(reportData.amount)}.
            </p>
          </div>

          {/* Status Final */}
          <div className="flex justify-between items-end border-t border-gray-200 pt-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Status Laporan</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-bold text-red-700 uppercase tracking-wide">
                  {reportData.status}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Penandatangan</p>
              <div className="flex flex-col items-center">
                {/* Placeholder Tanda Tangan */}
                <div className="font-handwriting text-2xl text-blue-900 italic mb-1">Dr. Budi Santoso</div>
                <div className="text-xs text-gray-600 font-bold uppercase">Kepala Divisi Investigasi</div>
                <div className="text-xs text-gray-500">BCA Legal Department</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Dokumen */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Dokumen ini digenerate secara otomatis oleh Sistem Keamanan BCA. 
            <br />
            Hak untuk menuntut secara hukum telah diaktifkan.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Generated on {new Date().toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="mt-6 flex justify-end gap-3">
        <button className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          Simpan sebagai PDF
        </button>
        <button className="px-4 py-2 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700 transition-colors shadow">
          Kirim ke Otoritas
        </button>
      </div>
    </div>
  );
};

export default ReportList;













// import React, { useState } from 'react';

// const ReportList = ({ chatWith, currentUser }) => {
//   // Data dummy yang lebih "real" dan variatif
//   const reports = [
//     {
//       id: 'TRX-8821-BCA',
//       bank: 'BCA',
//       amount: 5000000,
//       status: 'Sudah Diproses',
//       date: new Date('2024-01-15T10:30:00'),
//       description: 'Transfer Gaji Bulanan - PT Maju Jaya',
//       recipient: 'Bayu Pratama',
//       ref: 'BCA20240115001'
//     },
//     {
//       id: 'TRX-8822-BCA',
//       bank: 'BCA',
//       amount: 2500000,
//       status: 'Sudah Diproses',
//       date: new Date('2024-01-14T14:15:00'),
//       description: 'Pembayaran Invoice #INV-2024-001',
//       recipient: 'CV. Teknologi Digital',
//       ref: 'BCA20240114002'
//     },
//     {
//       id: 'TRX-8823-BCA',
//       bank: 'BCA',
//       amount: 1000000,
//       status: 'Sudah Diproses',
//       date: new Date('2024-01-13T09:45:00'),
//       description: 'Retur Pembayaran - Refund Order #ORD-556',
//       recipient: 'Toko Online Berkah',
//       ref: 'BCA20240113003'
//     },
//     {
//       id: 'TRX-8824-BCA',
//       bank: 'BCA',
//       amount: 750000,
//       status: 'Sudah Diproses',
//       date: new Date('2024-01-12T16:20:00'),
//       description: 'Pembayaran Listrik PLN',
//       recipient: 'PLN Pusat',
//       ref: 'BCA20240112004'
//     },
//     {
//       id: 'TRX-8825-BCA',
//       bank: 'BCA',
//       amount: 3200000,
//       status: 'Sudah Diproses',
//       date: new Date('2024-01-11T11:00:00'),
//       description: 'Transfer Antar Rekening',
//       recipient: 'Bayu Pratama',
//       ref: 'BCA20240111005'
//     }
//   ];

//   // Filter hanya BCA yang sudah diproses (meski di data dummy sudah semua BCA)
//   const bcaProcessedReports = reports.filter(
//     report => report.bank === 'BCA' && report.status === 'Sudah Diproses'
//   );

//   // Format Rupiah
//   const formatRupiah = (amount) => {
//     return new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0
//     }).format(amount);
//   };

//   // Format Tanggal & Jam
//   const formatDate = (date) => {
//     return new Intl.DateTimeFormat('id-ID', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     }).format(date);
//   };

//   return (
//     <div className="w-full max-w-4xl mx-auto p-4">
//       {/* Header Laporan */}
//       <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-t-xl p-6 shadow-lg text-white">
//         <div className="flex justify-between items-start">
//           <div>
//             <h2 className="text-2xl font-bold flex items-center gap-2">
//               <svg className="w-8 h-8 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               Laporan Transaksi BCA
//             </h2>
//             <p className="text-blue-100 text-sm mt-1 ml-10">
//               Status: <span className="font-semibold text-white">Sudah Diproses</span>
//             </p>
//           </div>
//           <div className="text-right">
//             <p className="text-sm text-blue-200">Total Transaksi</p>
//             <p className="text-3xl font-bold">{bcaProcessedReports.length}</p>
//           </div>
//         </div>
//       </div>

//       {/* Container Tabel */}
//       <div className="bg-white border-x border-b border-gray-200 rounded-b-xl shadow-lg overflow-hidden">
//         {/* Header Tabel */}
//         <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//           <div className="col-span-3">Detail Transaksi</div>
//           <div className="col-span-2">Tanggal & Waktu</div>
//           <div className="col-span-2">Nominal</div>
//           <div className="col-span-3">Status</div>
//           <div className="col-span-2 text-right">Aksi</div>
//         </div>

//         {/* List Transaksi */}
//         <div className="divide-y divide-gray-100">
//           {bcaProcessedReports.length > 0 ? (
//             bcaProcessedReports.map((report) => (
//               <div 
//                 key={report.id} 
//                 className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-blue-50 transition-colors duration-150 items-center group"
//               >
//                 {/* Detail Transaksi */}
//                 <div className="col-span-3">
//                   <div className="flex items-center gap-3">
//                     {/* Icon Bank BCA */}
//                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
//                       <span className="text-blue-700 font-bold text-xs">BCA</span>
//                     </div>
//                     <div>
//                       <p className="font-semibold text-gray-900 text-sm">{report.description}</p>
//                       <p className="text-xs text-gray-500 mt-0.5">
//                         {report.recipient} • <span className="font-mono text-gray-400">{report.ref}</span>
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Tanggal */}
//                 <div className="col-span-2">
//                   <p className="text-sm font-medium text-gray-900">{formatDate(report.date)}</p>
//                   <p className="text-xs text-gray-500">ID: {report.id}</p>
//                 </div>

//                 {/* Nominal */}
//                 <div className="col-span-2">
//                   <p className="text-lg font-bold text-green-600">{formatRupiah(report.amount)}</p>
//                   <p className="text-xs text-gray-400">Debit</p>
//                 </div>

//                 {/* Status */}
//                 <div className="col-span-3">
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                     <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full">
//                       {report.status}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Aksi */}
//                 <div className="col-span-2 text-right">
//                   <button className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded hover:bg-blue-100 transition-colors">
//                     Detail
//                   </button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="px-6 py-12 text-center">
//               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//               </div>
//               <p className="text-gray-500 text-sm">Tidak ada laporan transaksi BCA yang sudah diproses.</p>
//             </div>
//           )}
//         </div>

//         {/* Footer Ringkasan */}
//         {bcaProcessedReports.length > 0 && (
//           <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm">
//             <div className="text-gray-600">
//               <span className="font-semibold">Total Nominal:</span>{' '}
//               <span className="font-bold text-gray-900">
//                 {formatRupiah(bcaProcessedReports.reduce((sum, item) => sum + item.amount, 0))}
//               </span>
//             </div>
//             <div className="text-gray-400 text-xs">
//               Data diperbarui: {new Date().toLocaleString('id-ID')}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ReportList;











// // import React from 'react';

// // // 🔹 Tambahkan export default di sini agar bisa diimport di file lain
// // const ReportList = ({ chatWith, currentUser }) => {
// //   // Data contoh laporan transaksi BCA
// //   const reports = [
// //     {
// //       id: 1,
// //       bank: 'BCA',
// //       amount: 5700000,
// //       status: 'Sudah Diproses',
// //       date: '2026-08-18',
// //       description: 'Penggelapan Uang Gaji'
// //     }
// //   ];

// //   // Filter hanya bank BCA yang sudah diproses ,
// //     // {
// //     //   id: 2,
// //     //   bank: 'BCA',
// //     //   amount: 2500000,
// //     //   status: 'Sudah Diproses',
// //     //   date: '2024-01-14',
// //     //   description: 'Pembayaran invoice #123'
// //     // },
// //     // {
// //     //   id: 3,
// //     //   bank: 'BCA',
// //     //   amount: 1000000,
// //     //   status: 'Sudah Diproses',
// //     //   date: '2024-01-13',
// //     //   description: 'Retur pembayaran'
// //     // }
  
// //   const bcaProcessedReports = reports.filter(
// //     report => report.bank === 'BCA' && report.status === 'Sudah Diproses'
// //   );

// //   return (
// //     <div className="w-full overflow-y-auto px-2 sm:px-4">
// //       <div className="bg-white rounded-lg shadow">
// //         {/* Header Laporan */}
// //         <div className="px-4 py-3 border-b border-gray-200">
// //           <h3 className="text-lg font-semibold text-gray-900">
// //             Laporan Transaksi BCA - Sudah Diproses
// //           </h3>
// //           <p className="text-sm text-gray-500 mt-1">
// //             Total: {bcaProcessedReports.length} transaksi
// //           </p>
// //         </div>

// //         {/* List Laporan */}
// //         <div className="divide-y divide-gray-200">
// //           {bcaProcessedReports.map((report) => (
// //             <div key={report.id} className="px-4 py-3 hover:bg-gray-50">
// //               <div className="flex items-center justify-between">
// //                 <div className="flex-1">
// //                   <div className="flex items-center gap-2">
// //                     <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
// //                       BCA
// //                     </span>
// //                     <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
// //                       {report.status}
// //                     </span>
// //                   </div>
// //                   <p className="mt-1 text-sm text-gray-900 font-medium">
// //                     Rp {report.amount.toLocaleString('id-ID')}
// //                   </p>
// //                   <p className="text-xs text-gray-500 mt-1">
// //                     {report.description}
// //                   </p>
// //                 </div>
// //                 <div className="text-right">
// //                   <p className="text-xs text-gray-500">
// //                     {new Date(report.date).toLocaleDateString('id-ID', {
// //                       day: 'numeric',
// //                       month: 'short',
// //                       year: 'numeric'
// //                     })}
// //                   </p>
// //                   <button className="mt-2 text-xs text-blue-600 hover:text-blue-800">
// //                     Lihat Detail
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           ))}

// //           {bcaProcessedReports.length === 0 && (
// //             <div className="px-4 py-8 text-center">
// //               <p className="text-sm text-gray-500">
// //                 Tidak ada laporan BCA yang sudah diproses
// //               </p>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // 🔹 WAJIB: Export komponen ini agar bisa dipakai di file lain
// // export default ReportList;// import React from 'react';

// // //   const ReportList = ({ chatWith, currentUser }) => {
// // //   // Data contoh laporan transaksi BCA
// // //   const reports = [
// // //     {
// // //       id: 1,
// // //       bank: 'BCA',
// // //       amount: 5000000,
// // //       status: 'Sudah Diproses',
// // //       date: '2024-01-15',
// // //       description: 'Transfer gaji bulanan'
// // //     },
// // //     {
// // //       id: 2,
// // //       bank: 'BCA',
// // //       amount: 2500000,
// // //       status: 'Sudah Diproses',
// // //       date: '2024-01-14',
// // //       description: 'Pembayaran invoice #123'
// // //     },
// // //     {
// // //       id: 3,
// // //       bank: 'BCA',
// // //       amount: 1000000,
// // //       status: 'Sudah Diproses',
// // //       date: '2024-01-13',
// // //       description: 'Retur pembayaran'
// // //     }
// // //   ];

// // //   // Filter hanya bank BCA yang sudah diproses
// // //   const bcaProcessedReports = reports.filter(
// // //     report => report.bank === 'BCA' && report.status === 'Sudah Diproses'
// // //   );

// // //   return (
// // //     <div className="w-full overflow-y-auto px-2 sm:px-4">
// // //       <div className="bg-white rounded-lg shadow">
// // //         {/* Header Laporan */}
// // //         <div className="px-4 py-3 border-b border-gray-200">
// // //           <h3 className="text-lg font-semibold text-gray-900">
// // //             Laporan Transaksi BCA - Sudah Diproses
// // //           </h3>
// // //           <p className="text-sm text-gray-500 mt-1">
// // //             Total: {bcaProcessedReports.length} transaksi
// // //           </p>
// // //         </div>

// // //         {/* List Laporan */}
// // //         <div className="divide-y divide-gray-200">
// // //           {bcaProcessedReports.map((report) => (
// // //             <div key={report.id} className="px-4 py-3 hover:bg-gray-50">
// // //               <div className="flex items-center justify-between">
// // //                 <div className="flex-1">
// // //                   <div className="flex items-center gap-2">
// // //                     <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
// // //                       BCA
// // //                     </span>
// // //                     <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
// // //                       {report.status}
// // //                     </span>
// // //                   </div>
// // //                   <p className="mt-1 text-sm text-gray-900 font-medium">
// // //                     Rp {report.amount.toLocaleString('id-ID')}
// // //                   </p>
// // //                   <p className="text-xs text-gray-500 mt-1">
// // //                     {report.description}
// // //                   </p>
// // //                 </div>
// // //                 <div className="text-right">
// // //                   <p className="text-xs text-gray-500">
// // //                     {new Date(report.date).toLocaleDateString('id-ID', {
// // //                       day: 'numeric',
// // //                       month: 'short',
// // //                       year: 'numeric'
// // //                     })}
// // //                   </p>
// // //                   <button className="mt-2 text-xs text-blue-600 hover:text-blue-800">
// // //                     Lihat Detail
// // //                   </button>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           ))}

// // //           {bcaProcessedReports.length === 0 && (
// // //             <div className="px-4 py-8 text-center">
// // //               <p className="text-sm text-gray-500">
// // //                 Tidak ada laporan BCA yang sudah diproses
// // //               </p>
// // //             </div>
// // //           )}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };
