"use client"
import React, { useState, useEffect } from 'react';
import { database } from '../config/firebase';
import { ref as databaseRef, set } from 'firebase/database';

const AddUserComponent = () => { 
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddUser = async () => {
        if (!name) {
            setMessage('Nama tidak boleh kosong!');
            return;
        }

        setIsSubmitting(true);
        const usersRef = databaseRef(database, `chat/users/${name}`);  // `name` menjadi kunci
        const createdAt = new Date().toISOString();

        const newUser = {
            name: name,
            createdAt: createdAt,
            status: 'Active',
        };

        try {
            await set(usersRef, newUser);  // Set data dengan name sebagai kunci
            setMessage('User berhasil ditambahkan!');
            setName('');
        } catch (error) {
            console.error('Gagal menambahkan user:', error);
            setMessage('Terjadi kesalahan saat menambahkan user.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 20000); // Hapus pesan setelah 20 detik
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Tambah User Baru</h2>
            <input
                type="text"
                placeholder="Masukkan nama user"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 mb-4 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
            />
            <button
                type="button"
                onClick={handleAddUser}
                className={`text-white ${isSubmitting ? 'bg-blue-700' : 'bg-blue-700 hover:bg-blue-800'} focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 inline-flex items-center`}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <svg
                            aria-hidden="true"
                            role="status"
                            className="inline w-4 h-4 mr-3 text-white animate-spin"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="#E5E7EB"
                            />
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentColor"
                            />
                        </svg>
                        Loading...
                    </>
                ) : (
                    'Tambah User'
                )}
            </button>
            {message && <p className="mt-2 text-center text-sm text-gray-600">{message}</p>}
        </div>
    );
};

export default AddUserComponent;


// "use client"
// import React, { useState, useEffect } from 'react';
// import { database } from '../config/firebase';
// import { ref as databaseRef, push, set } from 'firebase/database';

// const AddUserComponent = () => {
//     const [name, setName] = useState('');
//     const [message, setMessage] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     const handleAddUser = async () => {
//         if (!name) {
//             setMessage('Nama tidak boleh kosong!');
//             return;
//         }

//         setIsSubmitting(true);
//         const usersRef = databaseRef(database, 'chat/users');
//         const newUserRef = push(usersRef);
//         const createdAt = new Date().toISOString();

//         const newUser = {
//             name: name,
//             createdAt: createdAt,
//             status: 'Active', 
//         };

//         try {
//             await set(newUserRef, newUser);
//             setMessage('User berhasil ditambahkan!');
//             setName('');
//         } catch (error) {
//             console.error('Gagal menambahkan user:', error);
//             setMessage('Terjadi kesalahan saat menambahkan user.');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     useEffect(() => {
//         if (message) {
//             const timer = setTimeout(() => setMessage(''), 20000); // Hapus pesan setelah 20 detik
//             return () => clearTimeout(timer);
//         }
//     }, [message]);

//     return (
//         <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-md">
//             <h2 className="text-2xl font-bold mb-4">Tambah User Baru</h2>
//             <input
//                 type="text"
//                 placeholder="Masukkan nama user"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="w-full px-4 py-2 mb-4 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 disabled={isSubmitting}
//             />
//             <button
//                 type="button"
//                 onClick={handleAddUser}
//                 className={`text-white ${isSubmitting ? 'bg-blue-700' : 'bg-blue-700 hover:bg-blue-800'} focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 inline-flex items-center`}
//                 disabled={isSubmitting}
//             >
//                 {isSubmitting ? (
//                     <>
//                         <svg
//                             aria-hidden="true"
//                             role="status"
//                             className="inline w-4 h-4 mr-3 text-white animate-spin"
//                             viewBox="0 0 100 101"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                         >
//                             <path
//                                 d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
//                                 fill="#E5E7EB"
//                             />
//                             <path
//                                 d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
//                                 fill="currentColor"
//                             />
//                         </svg>
//                         Loading...
//                     </>
//                 ) : (
//                     'Tambah User'
//                 )}
//             </button>
//             {message && <p className="mt-2 text-center text-sm text-gray-600">{message}</p>}
//         </div>
//     );
// };

// export default AddUserComponent;
