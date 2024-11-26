// 'use client';

// import { database } from '../config/firebase';
// import { ref as databaseRef, set, push } from 'firebase/database';
// import { useState } from 'react';
// import dynamic from 'next/dynamic';
// import * as pdfjsLib from 'pdfjs-dist';

// // Tambahkan worker untuk pdfjs
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// export default function UploadData() {
//   const [pdfFile, setPdfFile] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);

//   const handleFileChange = (e) => {
//     setPdfFile(e.target.files[0]);
//   };

//   const parseTableFromPdf = async (fileBuffer) => {
//     const pdfData = new Uint8Array(fileBuffer);
//     const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
//     const dataToUpload = [];

//     for (let i = 1; i <= pdfDoc.numPages; i++) {
//       const page = await pdfDoc.getPage(i);
//       const textContent = await page.getTextContent();
//       const lines = textContent.items.map((item) => item.str).join('\n').split('\n');

//       lines.forEach((line) => {
//         const columns = line.split(/\s+/);
//         if (columns.length >= 6) {
//           const parsedData = {
//             name: columns[1] || '',
//             gender: columns[2] || '',
//             usia: parseInt(columns[3], 10) || 0,
//             alamat: columns[4] || '',
//             rt: parseInt(columns[5], 10) || 0,
//             rw: parseInt(columns[6], 10) || 0,
//             ket: '-',
//             createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
//           };
//           dataToUpload.push(parsedData);
//         }
//       });
//     }

//     return dataToUpload;
//   };

//   const handleUpload = async () => {
//     if (!pdfFile) return alert('Pilih file PDF terlebih dahulu!');

//     setIsUploading(true);

//     try {
//       const fileBuffer = await pdfFile.arrayBuffer();
//       const parsedData = await parseTableFromPdf(fileBuffer);

//       if (parsedData.length === 0) {
//         alert('Tidak ada data yang ditemukan di PDF.');
//         setIsUploading(false);
//         return;
//       }

//       const dataRef = databaseRef(database, 'data');
//       parsedData.forEach((data) => {
//         const newRef = push(dataRef);
//         set(newRef, data);
//       });

//       alert('Data berhasil diupload!');
//     } catch (error) {
//       console.error('Error uploading data:', error);
//       alert('Terjadi kesalahan saat mengupload data.');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto mt-10 p-5 bg-white shadow-md rounded-md">
//       <h1 className="text-xl font-bold mb-5 text-center">Upload Data dari PDF</h1>
//       <div className="flex flex-col gap-4">
//         <input
//           type="file"
//           accept="application/pdf"
//           onChange={handleFileChange}
//           className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring focus:ring-blue-500"
//         />
//         <button
//           onClick={handleUpload}
//           className={`w-full px-4 py-2 text-white font-semibold rounded-md ${
//             isUploading
//               ? 'bg-gray-500 cursor-not-allowed'
//               : 'bg-blue-500 hover:bg-blue-600'
//           }`}
//           disabled={isUploading}
//         >
//           {isUploading ? 'Uploading...' : 'Upload'}
//         </button>
//       </div>
//     </div>
//   );
// }

'use client';
import { database } from '../config/firebase';
import { ref as databaseRef, set, push } from 'firebase/database';
import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

export default function UploadData() {
  const [pdfFile, setPdfFile] = useState(null);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const parseTableFromPdf = async (fileBuffer) => {
    const pdfData = new Uint8Array(fileBuffer);
    const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const dataToUpload = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const lines = textContent.items.map((item) => item.str).join('\n').split('\n');

      lines.forEach((line) => {
        const columns = line.split(/\s+/); // Pisahkan berdasarkan spasi
        if (columns.length >= 6) {
          const parsedData = {
            name: columns[1] || '',
            gender: columns[2] || '',
            usia: parseInt(columns[3], 10) || 0,
            alamat: columns[4] || '',
            rt: parseInt(columns[5], 10) || 0,
            rw: parseInt(columns[6], 10) || 0,
            ket: '-',
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
          dataToUpload.push(parsedData);
        }
      });
    }

    return dataToUpload;
  };

  const handleUpload = async () => {
    if (!pdfFile) return alert('Pilih file PDF terlebih dahulu!');

    const fileBuffer = await pdfFile.arrayBuffer();
    const parsedData = await parseTableFromPdf(fileBuffer);

    if (parsedData.length === 0) return alert('Tidak ada data yang ditemukan di PDF.');

    const dataRef = databaseRef(database, 'data');
    parsedData.forEach((data) => {
      const newRef = push(dataRef);
      set(newRef, data);
    });

    alert('Data berhasil diupload!');
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

// // // import { database } from '../config/firebase';
// // // import { ref as databaseRef, set, push } from 'firebase/database';
// // // import { useState } from 'react';
// // // import { PDFDocument } from 'pdf-lib';

// // // export default function UploadData() {
// // //   const [pdfFile, setPdfFile] = useState(null);

// // //   const handleFileChange = (e) => {
// // //     setPdfFile(e.target.files[0]);
// // //   };

// // //   const parseTableFromPdf = async (fileBuffer) => {
// // //     const pdfDoc = await PDFDocument.load(fileBuffer);
// // //     const pages = pdfDoc.getPages();
// // //     const dataToUpload = [];

// // //     for (const page of pages) {
// // //       const textContent = await page.getTextContent();
// // //       const lines = textContent.items.map((item) => item.str).join('\n').split('\n');

// // //       // Contoh: Memproses tabel PDF (sesuaikan dengan struktur PDF Anda)
// // //       lines.forEach((line) => {
// // //         const columns = line.split(/\s+/); // Pisahkan berdasarkan spasi
// // //         if (columns.length >= 6) {
// // //           const parsedData = {
// // //             name: columns[1] || '',
// // //             gender: columns[2] || '',
// // //             usia: parseInt(columns[3], 10) || 0,
// // //             alamat: columns[4] || '',
// // //             rt: parseInt(columns[5], 10) || 0,
// // //             rw: parseInt(columns[6], 10) || 0,
// // //             ket: '-',
// // //             createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
// // //           };
// // //           dataToUpload.push(parsedData);
// // //         }
// // //       });
// // //     }

// // //     return dataToUpload;
// // //   };

// // //   const handleUpload = async () => {
// // //     if (!pdfFile) return alert('Pilih file PDF terlebih dahulu!');

// // //     const fileBuffer = await pdfFile.arrayBuffer();
// // //     const parsedData = await parseTableFromPdf(fileBuffer);

// // //     if (parsedData.length === 0) return alert('Tidak ada data yang ditemukan di PDF.');

// // //     const dataRef = databaseRef(database, 'data');
// // //     parsedData.forEach((data) => {
// // //       const newRef = push(dataRef);
// // //       set(newRef, data);
// // //     });

// // //     alert('Data berhasil diupload!');
// // //   };

// // //   return (
// // //     <div>
// // //       <input type="file" accept="application/pdf" onChange={handleFileChange} />
// // //       <button onClick={handleUpload}>Upload</button>
// // //     </div>
// // //   );
// // // }
