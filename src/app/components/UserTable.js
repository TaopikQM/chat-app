"use client"
import React, { useEffect, useState } from 'react';
import { database } from '../config/firebase';
import { ref as databaseRef, get } from 'firebase/database';

const UsersTable = () => {
  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserKegiatan, setEditUserKegiatan] = useState('');
  const [loading, setLoading] = useState(false);

  // Fungsi untuk mengambil data dari Firebase Realtime Database
  const fetchUsers = async () => {
    const usersRef = databaseRef(database, 'chat/users'); // Path ke data pengguna
    try {
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersArray = Object.keys(usersData).map(key => ({
          id: key, // Menyimpan ID sebagai key Firebase
          ...usersData[key],
        }));
        setFetchedUsers(usersArray);
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  useEffect(() => {
    fetchUsers(); // Panggil fetchUsers saat komponen dimuat
  }, []);

  const handleEditId = (user) => {
    setEditUserId(user.id);
    setEditUserKegiatan(user.kegiatan || ''); // Mengatur kegiatan yang akan diedit
  };

  const handleSave = async () => {
    setLoading(true);
    const userRef = databaseRef(database, `chat/users/${editUserId}`);
    try {
      await set(userRef, {
        ...fetchedUsers.find(user => user.id === editUserId),
        kegiatan: editUserKegiatan,
      });
      // Update local state setelah data berhasil disimpan
      setFetchedUsers(fetchedUsers.map(user =>
        user.id === editUserId ? { ...user, kegiatan: editUserKegiatan } : user
      ));
      setEditUserId(null); // Keluar dari mode edit
    } catch (error) {
      console.error("Error saving data: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <table className="min-w-full bg-white border-collapse">
      <thead>
        <tr className="border-b">
          <th className="py-2 px-4">Name</th>
          <th className="py-2 px-4">Created At</th>
          <th className="py-2 px-4">Status</th>
          <th className="py-2 px-4">Action</th>
        </tr>
      </thead>
      <tbody>
        {fetchedUsers.length > 0 ? (
          fetchedUsers.map(user => (
            <tr key={user.id} className="border-b">
              <td className="py-2 px-4">
                {editUserId === user.id ? (
                  <input
                    type="text"
                    value={editUserKegiatan}
                    onChange={(e) => setEditUserKegiatan(e.target.value)}
                    className="border border-gray-400 px-2 py-1 rounded-md"
                  />
                ) : (
                  user.name
                )}
              </td>
              <td className="py-2 px-4">{user.createdAt}</td>
              <td className="py-2 px-4">{user.status}</td>
              <td className="py-2 px-4">
                {editUserId === user.id ? (
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleEditId(user)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="py-4 text-center">No users found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default UsersTable;

