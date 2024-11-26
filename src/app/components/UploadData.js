'use client';
import { database } from '../config/firebase';
import { ref as databaseRef, set, push } from 'firebase/database';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function UploadData() {
  const [pdfFile, setPdfFile] = useState(null);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const parseTableFromPdf = async (fileBuffer) => {
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pages = pdfDoc.getPages();
    const dataToUpload = [];

    for (const page of pages) {
      const textContent = await page.getTextContent();
      const lines = textContent.items.map((item) => item.str).join('\n').split('\n');

      // Contoh: Memproses tabel PDF (sesuaikan dengan struktur PDF Anda)
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
