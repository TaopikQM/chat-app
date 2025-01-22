"use client";
import React, { useState, useEffect } from 'react';

import { db } from '../config/firebase';  // Pastikan konfigurasi Firebase sudah benar
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

const ProvinsiPulauForm = () => {
  const [pulau, setPulau] = useState('');
  const [provinsi, setProvinsi] = useState('');
  const [provinsiList, setProvinsiList] = useState([]);
  const [urutan, setUrutan] = useState(1);
  const [pulauData, setPulauData] = useState([]);

  // Data Provinsi berdasarkan Pulau
  const pulauProvinsiData = {
    Sumatera: [
      'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi',
      'Bengkulu', 'Sumatera Selatan', 'Kepulauan Bangka Belitung', 'Lampung'
    ],
    Jawa: [
      'Banten', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur'
    ],
    'Bali dan Nusa Tenggara': [
      'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur'
    ],
    Kalimantan: [
      'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara'
    ],
    Sulawesi: [
      'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Sulawesi Tengah', 'Sulawesi Utara', 'Gorontalo'
    ],
    'Maluku dan Papua': [
      'Maluku', 'Maluku Utara', 'Papua Barat', 'Papua'
    ]
  };

  useEffect(() => {
    const pulauList = Object.keys(pulauProvinsiData);
    setPulauData(pulauList);
  }, []);

  // Fungsi untuk memilih Pulau dan provinsi yang sesuai
  const handlePulauChange = (event) => {
    const selectedPulau = event.target.value;
    setPulau(selectedPulau);
    if (selectedPulau) {
      setProvinsiList(pulauProvinsiData[selectedPulau]);
      setUrutan(1); // Reset urutan ke 1 saat memilih pulau baru
    }
  };

  // Fungsi untuk menambahkan data ke Firebase
  const handleAddProvinsi = async () => {
    if (!pulau || !provinsi) {
      alert('Pilih Pulau dan Provinsi terlebih dahulu!');
      return;
    }

    try {
      const createdAt = new Date();
      const docRef = await addDoc(collection(db, 'pulau', pulau, 'provinsi'), {
        name_pulau: pulau,
        name_provinsi: provinsi,
        urutan: urutan,
        createdAt: createdAt.toISOString(), // Tanggal dibuat
      });

      console.log('Provinsi berhasil ditambahkan dengan ID:', docRef.id);
      setProvinsi(''); // Reset input provinsi
      setUrutan(urutan + 1); // Update urutan provinsi setelah ditambahkan
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  return (
    <div>
      <h2>Tambah Provinsi Berdasarkan Pulau</h2>

      <div>
        <label>Pilih Pulau:</label>
        <select value={pulau} onChange={handlePulauChange}>
          <option value="">-- Pilih Pulau --</option>
          {pulauData.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Provinsi:</label>
        <select
          value={provinsi}
          onChange={(e) => setProvinsi(e.target.value)}
          disabled={!pulau}
        >
          <option value="">-- Pilih Provinsi --</option>
          {provinsiList.map((item, index) => (
            <option key={index} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button type="button" onClick={handleAddProvinsi}>
          Tambah Provinsi
        </button>
      </div>

      <h3>Provinsi di Pulau {pulau}</h3>
      <ul>
        {/* Menampilkan provinsi yang sudah ditambahkan ke Firebase */}
        {provinsiList.map((prov, index) => (
          <li key={prov}>
            {prov} (Urutan: {index + 1})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProvinsiPulauForm;
