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
            NAMA: columns[0] || '',
            JENIS KELAMIN: columns[1] || '',
            USIA: parseInt(columns[2], 10) || 0,
            DUSUN/ALAMAT: columns[3] || '',
            RT: parseInt(columns[4], 10) || 0,
            RW: parseInt(columns[5], 10) || 0,
            KET.: '-',
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
