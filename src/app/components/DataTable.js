import { useEffect, useState } from 'react';
import { database } from '../config/firebase';
import { ref as databaseRef, onValue } from 'firebase/database';

export default function DataTable() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(''); // '' | 'hadir' | 'tidak hadir'
  const [search, setSearch] = useState('');

  useEffect(() => {
    const dataRef = databaseRef(database, 'data');
    onValue(dataRef, (snapshot) => {
      const items = [];
      snapshot.forEach((childSnapshot) => {
        items.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      setData(items);
    });
  }, []);

  const filteredData = data.filter((item) => {
    const matchesFilter =
      filter === ''
        ? true
        : filter === 'hadir'
        ? item.status === 'hadir'
        : item.status !== 'hadir';

    const matchesSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.alamat.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalHadir = data.filter((item) => item.status === 'hadir').length;
  const totalTidakHadir = data.length - totalHadir;

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Cari..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select onChange={(e) => setFilter(e.target.value)}>
          <option value="">Semua</option>
          <option value="hadir">Hadir</option>
          <option value="tidak hadir">Tidak Hadir</option>
        </select>
      </div>

      <div>
        <p>Total: {data.length}</p>
        <p>Hadir: {totalHadir}</p>
        <p>Tidak Hadir: {totalTidakHadir}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Gender</th>
            <th>Usia</th>
            <th>Alamat</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item.id}>
              <td>{item.NAMA}</td>
              <td>{item.JENIS KELAMIN}</td>
              <td>{item.USIA}</td>
              <td>{item.DUSUN/ALAMAT}</td>
              <td>{item.status || 'Belum Hadir'}</td>
              <td>
                <button
                  onClick={() =>
                    set(databaseRef(database, `data/${item.id}/status`), 'hadir')
                  }
                >
                  Hadir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
