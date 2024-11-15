"use client"
import React, { useState } from 'react';
import { database } from '../config/firebase';
import { ref as databaseRef, push, set } from 'firebase/database';

const AddUser = () => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    const handleAddUser = async () => {
        if (!name) {
            setMessage('Nama tidak boleh kosong!');
            return;
        }

        const usersRef = databaseRef(database, 'users');
        const newUserRef = push(usersRef);
        const createdAt = new Date().toISOString();

        const newUser = {
            name: name,
            createdAt: createdAt,
        };

        try {
            await set(newUserRef, newUser);
            setMessage('User berhasil ditambahkan!');
            setName('');
        } catch (error) {
            console.error('Gagal menambahkan user:', error);
            setMessage('Terjadi kesalahan saat menambahkan user.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white border border-gray-200 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Tambah User Baru</h2>
            <input
                type="text"
                placeholder="Masukkan nama user"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 mb-4 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="button"
                onClick={handleAddUser}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
                Tambah User
            </button>
            {message && <p className="mt-2 text-center text-sm text-gray-600">{message}</p>}
        </div>
    );
};

export default AddUser;
