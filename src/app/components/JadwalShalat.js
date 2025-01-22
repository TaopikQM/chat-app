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


  const bulanList = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  
  // Ambil data provinsi dari Firebase
  useEffect(() => {
    fetch(provinsiURL)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          const provArray = [];

          // Looping untuk mengambil data provinsi di setiap pulau
          Object.keys(data).forEach((pulauKey) => {
            const provinsiObj = data[pulauKey].provinsi;

            Object.keys(provinsiObj).forEach((provKey) => {
              const prov = provinsiObj[provKey];
              provArray.push({
                id: prov.id, // ID provinsi
                name: prov.name_provinsi.toUpperCase(), // Nama provinsi
                key: prov.key, // key
                urutan: data[pulauKey].urutan_pulau, // Urutan provinsi berdasarkan urutan_pulau
              });
            });
          });

          // Urutkan provinsi berdasarkan urutan_pulau
          provArray.sort((a, b) => a.urutan - b.urutan);
          setProvinsiList(provArray);
        }
      })
      .catch((error) => console.error('Error fetching provinsi:', error));
  }, []);

  // Ambil data kabupaten saat provinsi berubah
  useEffect(() => {
     if (provinsi) {
    // Menemukan provinsi yang dipilih dari provinsiList
          const selectedProvinsi = provinsiList.find((prov) => prov.id === provinsi);
          if (selectedProvinsi) {
            // Mengirimkan name_provinsi
            getKabupaten(selectedProvinsi.key);
          }
      }
  }, [provinsi]);

  const getKabupaten = async (prov) => {
  try {
    const response = await fetch(`${host}ajax/getKabkoshalat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": "bimasislam_session=a%3A5%3A%7Bs%3A10%3A%22session_id%22%3Bs%3A32%3A%22539ea43a3db0c096e0cc9e215ff36886%22%3Bs%3A10%3A%22ip_address%22%3Bs%3A13%3A%22114.79.16.159%22%3Bs%3A10%3A%22user_agent%22%3Bs%3A111%3A%22Mozilla%2F5.0+%28Windows+NT+10.0%3B+Win64%3B+x64%29+AppleWebKit%2F537.36+%28KHTML%2C+like+Gecko%29+Chrome%2F131.0.0.0+Safari%2F537.36%22%3Bs%3A13%3A%22last_activity%22%3Bi%3A1737544359%3Bs%3A9%3A%22user_data%22%3Bs%3A0%3A%22%22%3B%7Db9f9372250887893737218d575da17dd; _ga_W825VCQ3Z3=GS1.1.1737544527.5.1.1737544610.0.0.0; _ga=GA1.1.1220341070.1737516614; PHPSESSID=8b71dep0r9n5vvefqogpllin64"
      },
      body: new URLSearchParams({ x: prov }),
      credentials: "include", // Mengizinkan pengiriman cookies
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const textData = await response.text();
    const jsonData = textData ? JSON.parse(textData) : [];

    setListKabupaten(jsonData);
  } catch (error) {
    console.error("Error fetching kabupaten:", error);
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
        <select value={provinsi} onChange={(e) => {
            const selectedProvinsi = e.target.value;
            setProvinsi(selectedProvinsi);
            // Menampilkan provinsi yang dipilih di console
            const selectedProvinsiObj = provinsiList.find((prov) => prov.id === selectedProvinsi);
            if (selectedProvinsiObj) {
              console.log(`Provinsi yang dipilih: ${selectedProvinsiObj.name}`);
            }
          }}>
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

// import { useState, useEffect } from 'react';

// const JadwalShalat = () => {
//   const host = 'https://bimasislam.kemenag.go.id/';
//   const provinsiURL = 'https://env-sib-default-rtdb.firebaseio.com/pulau.json';

//   const [provinsiList, setProvinsiList] = useState([]);
//   const [provinsi, setProvinsi] = useState('');
//   const [kabupaten, setKabupaten] = useState('');
//   const [listKabupaten, setListKabupaten] = useState([]);
//   const [bulan, setBulan] = useState('');
//   const [tahun, setTahun] = useState('');
//   const [jadwalShalat, setJadwalShalat] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Ambil data provinsi dari Firebase
//   useEffect(() => {
//     fetch(provinsiURL)
//       .then((response) => response.json())
//       .then((data) => {
//         if (data) {
//           const provArray = [];

//           // Looping untuk mengambil data provinsi di setiap pulau
//           Object.keys(data).forEach((pulauKey) => {
//             const provinsiObj = data[pulauKey].provinsi;

//             Object.keys(provinsiObj).forEach((provKey) => {
//               const prov = provinsiObj[provKey];
//               provArray.push({
//                 id: prov.id, // ID provinsi
//                 name: prov.name_provinsi, // Nama provinsi
//               });
//             });
//           });

//           setProvinsiList(provArray);
//         }
//       })
//       .catch((error) => console.error('Error fetching provinsi:', error));
//   }, []);

//   // Ambil data kabupaten saat provinsi berubah
//   useEffect(() => {
//     if (provinsi) {
//       getKabupaten(provinsi);
//     }
//   }, [provinsi]);

//   const getKabupaten = async (prov) => {
//     try {
//       const response = await fetch(`${host}ajax/getKabkoshalat`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: new URLSearchParams({ x: prov }),
//       });

//       const data = await response.text();
//       setListKabupaten(data ? JSON.parse(data) : []);
//     } catch (error) {
//       console.error('Error fetching kabupaten:', error);
//     }
//   };

//   const loadJadwalShalat = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${host}ajax/getShalatbln`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: new URLSearchParams({ x: provinsi, y: kabupaten, bln: bulan, thn: tahun }),
//       });

//       const data = await response.json();
//       if (data.status === 1) {
//         setJadwalShalat(data.data);
//       } else {
//         setJadwalShalat([]);
//       }
//     } catch (error) {
//       console.error('Error fetching jadwal shalat:', error);
//     }
//     setLoading(false);
//   };

//   return (
//     <div>
//       <div>
//         <label>Pilih Provinsi:</label>
//         <select value={provinsi} onChange={(e) => setProvinsi(e.target.value)}>
//           <option value="">Pilih Provinsi</option>
//           {provinsiList.map((prov, index) => (
//             <option key={index} value={prov.id}>{prov.name}</option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label>Pilih Kabupaten/Kota:</label>
//         <select value={kabupaten} onChange={(e) => setKabupaten(e.target.value)}>
//           <option value="">Pilih Kabupaten</option>
//           {listKabupaten.map((kab, index) => (
//             <option key={index} value={kab.id}>{kab.nama}</option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label>Bulan:</label>
//         <input type="number" value={bulan} onChange={(e) => setBulan(e.target.value)} />
//       </div>

//       <div>
//         <label>Tahun:</label>
//         <input type="number" value={tahun} onChange={(e) => setTahun(e.target.value)} />
//       </div>

//       <button onClick={loadJadwalShalat}>Cari Jadwal</button>

//       {loading && <p>Loading...</p>}

//       <div>
//         {jadwalShalat.map((item, index) => (
//           <div key={index}>
//             <p>{item.tanggal}: {item.subuh} - {item.isya}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default JadwalShalat;

// // import { useState, useEffect } from 'react';

// // const JadwalShalat = () => {
// //   const host = 'https://bimasislam.kemenag.go.id/';
// //   const provinsiURL = 'https://env-sib-default-rtdb.firebaseio.com/pulau.json';

// //   const [provinsiList, setProvinsiList] = useState([]);
// //   const [provinsi, setProvinsi] = useState('');
// //   const [kabupaten, setKabupaten] = useState('');
// //   const [listKabupaten, setListKabupaten] = useState([]);
// //   const [bulan, setBulan] = useState('');
// //   const [tahun, setTahun] = useState('');
// //   const [jadwalShalat, setJadwalShalat] = useState([]);
// //   const [loading, setLoading] = useState(false);

// //   // Ambil data provinsi dari Firebase
// //   useEffect(() => {
// //     fetch(provinsiURL)
// //       .then((response) => response.json())
// //       .then((data) => {
// //         if (data) {
// //           const provArray = Object.values(data).map((prov) => ({
// //             id: prov.id, // ID provinsi jika ada
// //             name: prov.name_provinsi, // Nama provinsi
// //           }));
// //           setProvinsiList(provArray);
// //         }
// //       })
// //       .catch((error) => console.error('Error fetching provinsi:', error));
// //   }, []);

// //   // Ambil data kabupaten saat provinsi berubah
// //   useEffect(() => {
// //     if (provinsi) {
// //       getKabupaten(provinsi);
// //     }
// //   }, [provinsi]);

// //   const getKabupaten = async (prov) => {
// //     try {
// //       const response = await fetch(`${host}ajax/getKabkoshalat`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/x-www-form-urlencoded',
// //         },
// //         body: new URLSearchParams({ x: prov }),
// //       });

// //       const data = await response.text();
// //       setListKabupaten(data ? JSON.parse(data) : []);
// //     } catch (error) {
// //       console.error('Error fetching kabupaten:', error);
// //     }
// //   };

// //   const loadJadwalShalat = async () => {
// //     setLoading(true);
// //     try {
// //       const response = await fetch(`${host}ajax/getShalatbln`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/x-www-form-urlencoded',
// //         },
// //         body: new URLSearchParams({ x: provinsi, y: kabupaten, bln: bulan, thn: tahun }),
// //       });

// //       const data = await response.json();
// //       if (data.status === 1) {
// //         setJadwalShalat(data.data);
// //       } else {
// //         setJadwalShalat([]);
// //       }
// //     } catch (error) {
// //       console.error('Error fetching jadwal shalat:', error);
// //     }
// //     setLoading(false);
// //   };

// //   return (
// //     <div>
// //       <div>
// //         <label>Pilih Provinsi:</label>
// //         <select value={provinsi} onChange={(e) => setProvinsi(e.target.value)}>
// //           <option value="">Pilih Provinsi</option>
// //           {provinsiList.map((prov, index) => (
// //             <option key={index} value={prov.id}>{prov.name}</option>
// //           ))}
// //         </select>
// //       </div>

// //       <div>
// //         <label>Pilih Kabupaten/Kota:</label>
// //         <select value={kabupaten} onChange={(e) => setKabupaten(e.target.value)}>
// //           <option value="">Pilih Kabupaten</option>
// //           {listKabupaten.map((kab, index) => (
// //             <option key={index} value={kab.id}>{kab.nama}</option>
// //           ))}
// //         </select>
// //       </div>

// //       <div>
// //         <label>Bulan:</label>
// //         <input type="number" value={bulan} onChange={(e) => setBulan(e.target.value)} />
// //       </div>

// //       <div>
// //         <label>Tahun:</label>
// //         <input type="number" value={tahun} onChange={(e) => setTahun(e.target.value)} />
// //       </div>

// //       <button onClick={loadJadwalShalat}>Cari Jadwal</button>

// //       {loading && <p>Loading...</p>}

// //       <div>
// //         {jadwalShalat.map((item, index) => (
// //           <div key={index}>
// //             <p>{item.tanggal}: {item.subuh} - {item.isya}</p>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // export default JadwalShalat;
