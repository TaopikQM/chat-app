"use client";
import { useState, useEffect } from 'react';

const JadwalShalat = () => {
  const host = 'https://bimasislam.kemenag.go.id/';
  const provinsiURL = 'https://env-sib-default-rtdb.firebaseio.com/pulau.json';

  const [provinsiList, setProvinsiList] = useState([]);
  const [provinsi, setProvinsi] = useState('');
  const [kabupaten, setKabupaten] = useState('');
  const [listKabupaten, setListKabupaten] = useState([]);
  const [bulan, setBulan] = useState('');
  const [tahun, setTahun] = useState('');
  const [jadwalShalat, setJadwalShalat] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ambil data provinsi dari Firebase
  useEffect(() => {
    fetch(provinsiURL)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          const provArray = Object.values(data).map((prov) => ({
            id: prov.id, // ID provinsi jika ada
            name: prov.name_provinsi, // Nama provinsi
          }));
          setProvinsiList(provArray);
        }
      })
      .catch((error) => console.error('Error fetching provinsi:', error));
  }, []);

  // Ambil data kabupaten saat provinsi berubah
  useEffect(() => {
    if (provinsi) {
      getKabupaten(provinsi);
    }
  }, [provinsi]);

  const getKabupaten = async (prov) => {
    try {
      const response = await fetch(`${host}ajax/getKabkoshalat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ x: prov }),
      });

      const data = await response.text();
      setListKabupaten(data ? JSON.parse(data) : []);
    } catch (error) {
      console.error('Error fetching kabupaten:', error);
    }
  };

  const loadJadwalShalat = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${host}ajax/getShalatbln`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ x: provinsi, y: kabupaten, bln: bulan, thn: tahun }),
      });

      const data = await response.json();
      if (data.status === 1) {
        setJadwalShalat(data.data);
      } else {
        setJadwalShalat([]);
      }
    } catch (error) {
      console.error('Error fetching jadwal shalat:', error);
    }
    setLoading(false);
  };

  return (
    <div>
      <div>
        <label>Pilih Provinsi:</label>
        <select value={provinsi} onChange={(e) => setProvinsi(e.target.value)}>
          <option value="">Pilih Provinsi</option>
          {provinsiList.map((prov, index) => (
            <option key={index} value={prov.id}>{prov.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Pilih Kabupaten/Kota:</label>
        <select value={kabupaten} onChange={(e) => setKabupaten(e.target.value)}>
          <option value="">Pilih Kabupaten</option>
          {listKabupaten.map((kab, index) => (
            <option key={index} value={kab.id}>{kab.nama}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Bulan:</label>
        <input type="number" value={bulan} onChange={(e) => setBulan(e.target.value)} />
      </div>

      <div>
        <label>Tahun:</label>
        <input type="number" value={tahun} onChange={(e) => setTahun(e.target.value)} />
      </div>

      <button onClick={loadJadwalShalat}>Cari Jadwal</button>

      {loading && <p>Loading...</p>}

      <div>
        {jadwalShalat.map((item, index) => (
          <div key={index}>
            <p>{item.tanggal}: {item.subuh} - {item.isya}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JadwalShalat;
