import React, { useState, useEffect } from 'react';

import { database } from '../config/firebase';
import { ref as databaseRef, push, set } from 'firebase/database';

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [editUserId, setEditUserId] = useState(null);
    const [editStatus, setEditStatus] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [fetchedUsers, setFetchedUsers] = useState([]);


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

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(users.map(user => user.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedItems(prevSelectedItems =>
            prevSelectedItems.includes(id)
                ? prevSelectedItems.filter(itemId => itemId !== id)
                : [...prevSelectedItems, id]
        );
    };

    const handleDeleteSelected = () => {
        const newUsers = users.filter(user => !selectedItems.includes(user.id));
        setUsers(newUsers);
        setSelectedItems([]);
    };

    const handleEditId = (user) => {
        setEditUserId(user.id);
        setEditStatus(user.status);
    };

    const handleSave = () => {
        setLoading(true);
        const updatedUsers = users.map(user =>
            user.id === editUserId ? { ...user, status: editStatus } : user
        );
        setUsers(updatedUsers);
        setLoading(false);
        setEditUserId(null);
    };

    const handleChangeStatusWithConfirmation = (user) => {
        if (window.confirm(`Are you sure you want to change the status of ${user.name}?`)) {
            const updatedUsers = users.map((item) =>
                item.id === user.id ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' } : item
            );
            setUsers(updatedUsers);
        }
    };

    const totalItems = users.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const displayedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getPagination = () => {
        let pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <div className="flex justify-between px-4 py-3">
                    <div className="flex">
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}
                            className="border rounded px-2 py-1"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
                <br />
                {selectedItems.length > 0 && (
                    <button
                        onClick={handleDeleteSelected}
                        className="bg-red-600 text-white px-4 py-2 rounded mb-4"
                    >
                        Hapus {selectedItems.length} Data
                    </button>
                )}

                <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
                    <thead>
                        <tr style={{ backgroundColor: '#569cd6' }} className="border-gray-400 text-white font-bold h-10">
                            <th rowSpan={2} className="text-center md:p-4 p-0 border-r">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={selectedItems.length === users.length}
                                />
                            </th>
                            <th rowSpan={2} className="text-center md:p-4 p-0 border-r">Nama</th>
                            <th rowSpan={2} className="text-center md:p-4 p-0 border-r">Tanggal Dibuat</th>
                            <th rowSpan={2} className="text-center md:p-4 p-0 border-r">Status</th>
                            <th rowSpan={2} className="text-center md:p-4 p-0">Aksi</th>
                        </tr>
                    </thead>
                   <tbody>
                    {displayedUsers.length > 0 ? (
                      displayedUsers.map(user => (
                        <tr key={user.id} className="border-gray-600 border">
                          <td className="py-2 px-4 text-center border-r">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(user.id)}
                              onChange={() => handleCheckboxChange(user.id)}
                            />
                          </td>
                          <td className="py-2 px-4 text-left border-r">
                            {editUserId === user.id ? (
                              <input
                                type="text"
                                value={user.name}
                                onChange={(e) => setUsers(users.map((u) => u.id === user.id ? { ...u, name: e.target.value } : u))}
                                className="border border-gray-400 px-2 py-1 rounded-md"
                              />
                            ) : (
                              user.name
                            )}
                          </td>
                          <td className="py-2 px-4 text-left border-r">{user.createdAt}</td>
                          <td className="py-2 px-4 text-center border-r">{user.status}</td>
                          <td className="py-2 px-4 text-center">
                            {editUserId === user.id ? (
                              <div className="flex justify-between">
                                <select
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value)}
                                  className="border border-gray-400 px-2 py-1 rounded-md"
                                >
                                  <option value="Active">Active</option>
                                  <option value="Inactive">Inactive</option>
                                </select>
                                <button
                                  onClick={handleSave}
                                  disabled={loading}
                                  className="ml-2 bg-green-500 text-white px-4 py-2 rounded-md"
                                >
                                  {loading ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleChangeStatusWithConfirmation(user)}
                                  className="bg-yellow-500 text-white px-4 py-2 rounded-md"
                                >
                                  Toggle Status
                                </button>
                                <button
                                  onClick={() => handleEditId(user)}
                                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                >
                                  Edit Status
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
            </div>

            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                    {getPagination().map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserTable;
