"use client"
import { useEffect, useState } from 'react';
import { database } from '../config/firebase';
import { ref, child, get } from 'firebase/database';

const UsersTable = () => {
    const [users, setUsers] = useState([]);
    const [editUserId, setEditUserId] = useState(null);
    const [editUserName, setEditUserName] = useState("");
    const [editUserNim, setEditUserNim] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [sortOrderName, setSortOrderName] = useState('asc');

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const usersRef = ref(database, 'users');
                const snapshot = await get(usersRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const usersArray = Object.keys(data).map((key) => ({
                        id: key,
                        ...data[key],
                    }));
                    setUsers(usersArray);
                    setTotalItems(usersArray.length);
                } else {
                    console.log('No data available');
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleEditClick = (user) => {
        setEditUserId(user.id);
        setEditUserName(user.name);
        setEditUserNim(user.nim);
    };

    const handleUpdateUser = async () => {
        setIsLoading(true);
        try {
            const userRef = ref(database, 'users/' + editUserId);
            await set(userRef, {
                name: editUserName,
                nim: editUserNim,
            });

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === editUserId
                        ? { ...user, name: editUserName, nim: editUserNim }
                        : user
                )
            );
            setEditUserId(null); // Keluar dari mode edit
        } catch (error) {
            console.error('Error updating user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
            return;
        }

        const userRef = ref(database, 'users/' + user.id);
        await set(userRef, null); // Menghapus data pengguna

        setUsers(users.filter((u) => u.id !== user.id));
        alert("Data berhasil dihapus.");
    };

    const handleChangeStatus = async (user) => {
        const newStatus = user.status === "active" ? "inactive" : "active";
        const userRef = ref(database, 'users/' + user.id);
        await set(userRef, { ...user, status: newStatus });

        setUsers(users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.nim.includes(searchTerm)
    );

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Reset to the first page on items per page change
    };

    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const sortByName = () => {
        const sortByName = [...users].sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return sortOrderName === 'asc' ? comparison : -comparison;
        });
        setUsers(sortByName);
        setSortOrderName(sortOrderName === 'asc' ? 'desc' : 'asc');
    };

    const getPagination = () => {
        let pages = [];
        if (totalPages <= 5) {
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            if (currentPage <= 3) {
                pages = [1, 2, 3, 4, 5, '...'];
            } else if (currentPage >= totalPages - 2) {
                pages = [
                    1,
                    '...',
                    totalPages - 4,
                    totalPages - 3,
                    totalPages - 2,
                    totalPages - 1,
                    totalPages,
                ];
            } else {
                pages = [
                    1,
                    '...',
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    '...',
                    totalPages,
                ];
            }
        }
        return pages;
    };

    return (
        <div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <div className="flex justify-between items-center px-4 py-3">
                    <div className="text-xl font-bold mb-4">Daftar Pengguna</div>
                    <div className="relative">
                        <button
                            onClick={() => setShowForm((prev) => !prev)}
                            type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 m-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                        >
                            Add
                        </button>
                        {showForm && <AddUser />}
                    </div>
                </div>

                <div className="flex justify-between px-4 py-3">
                    <div className="flex">
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="border rounded px-2 py-1"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <div className="mt-4 text-sm text-gray-500">
                            Total User: {filteredUsers.length}
                        </div>
                    </div>

                    <div className="relative">
                        <form className="max-w-md mx-auto ml-2">
                            <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">
                                Search
                            </label>
                            <input
                                onChange={handleSearch}
                                value={searchTerm}
                                type="search"
                                id="default-search"
                                className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Search"
                                required
                            />
                        </form>
                    </div>
                </div>

                <table className="min-w-full bg-white border border-gray-300">
                    <thead className="border">
                        <tr>
                            <th className="py-2 px-4">No</th>
                            <th className="text-center md:p-4 p-0">
                                Nama
                                <button onClick={sortByName} className="ml-2">
                                    {sortOrderName === 'asc' ? '↑' : '↓'}
                                </button>
                            </th>
                            <th className="py-2 px-4">NIM</th>
                            <th className="py-2 px-4">Status</th>
                            <th className="py-2 px-4">Register</th>
                            <th className="py-2 px-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length > 0 ? (
                            currentUsers.map((user, index) => (
                                <tr key={user.id} className="border">
                                    <td className="py-2 px-4 text-left">{index + 1}</td>
                                    <td className="py-2 px-4 text-left">
                                        {editUserId === user.id ? (
                                            <input
                                                type="text"
                                                value={editUserName}
                                                onChange={(e) => setEditUserName(e.target.value)}
                                                className="border border-gray-400 px-2 py-1 rounded-md"
                                            />
                                        ) : (
                                            user.name
                                        )}
                                    </td>
                                    <td className="py-2 px-4 text-left">
                                        {editUserId === user.id ? (
                                            <input
                                                type="text"
                                                value={editUserNim}
                                                onChange={(e) => setEditUserNim(e.target.value)}
                                                className="border border-gray-400 px-2 py-1 rounded-md"
                                            />
                                        ) : (
                                            user.nim
                                        )}
                                    </td>
                                    <td className="py-2 px-4 text-left">
                                        <span
                                            className={`px-2 py-1 rounded-full ${
                                                user.status === "active" ? "bg-green-500" : "bg-red-500"
                                            }`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4">{user.register_date}</td>
                                    <td className="py-2 px-4">
                                        {editUserId === user.id ? (
                                            <button
                                                onClick={handleUpdateUser}
                                                className="bg-blue-500 text-white px-3 py-1 rounded"
                                            >
                                                Update
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded ml-2"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => handleChangeStatus(user)}
                                                    className={`bg-${
                                                        user.status === "active" ? "red" : "green"
                                                    }-500 text-white px-3 py-1 rounded ml-2`}
                                                >
                                                    {user.status === "active" ? "Deactivate" : "Activate"}
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-2 px-4 text-center">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="flex justify-between items-center px-4 py-3">
                    <div className="flex">
                        {getPagination().map((page, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentPage(page === '...' ? currentPage : page)}
                                className={`py-1 px-3 rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-white"}`}
                                disabled={page === '...'}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersTable;
