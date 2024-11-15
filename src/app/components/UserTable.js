"use client"
import AddUser from '../components/AddUser';
import { useEffect, useState } from 'react';
import { database } from '../config/firebase';
import { ref, get, set, update, remove } from 'firebase/database';

const UsersTable = () => {
    const [users, setUsers] = useState([]);
    const [editUser, setEditUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', status: '' });



    const [absenData, setAbsenData] = useState([]);

    const [editUserId, setEditUserId] = useState(null);
    const [editUserName, setEditUserName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // State untuk menyimpan nilai input pencarian

    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    
    const [sortOrderName, setSortOrderName] = useState('asc');

    const [totalActive, setTotalActive] = useState(0);
    const [totalInactive, setTotalInactive] = useState(0);
    const [totalRegistered, setTotalRegistered] = useState(0);
    const [totalNotRegistered, setTotalNotRegistered] = useState(0);

    const toggleForm = () => {
        setShowForm(!showForm);
    };

    const sortByName = () => { 
        const sortByName = [...users].sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return sortOrderName === 'asc' ? comparison : -comparison;
        });
        setUsers(sortByName);
        setSortOrderName(sortOrderName === 'asc'? 'desc' : 'asc');
    }

    useEffect(() => {
        // Fetch Users from Firebase
        const fetchUsers = async () => {
            try {
                const usersRef = ref(database, 'chat/users/');
                const snapshot = await get(usersRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const usersArray = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
                    setUsers(usersArray);
                    setTotalItems(usersArray.length);

                    const totals = {
                        active: 0,
                        inactive: 0,
                    };

                    usersArray.forEach(user => {
                        if (user.status === 'Active') {
                            totals.active++;
                        } else if (user.status === 'Inactive') {
                            totals.inactive++;
                        }

                        
                    });

                    setTotalActive(totals.active);
                    setTotalInactive(totals.inactive);
                } else {
                    console.log("No data available");
                }
            } catch (error) {
                console.error("Error fetching users from Firebase:", error);
            }
        };

        fetchUsers();
    }, []);

    const handleEditClick = (user) => {
        setEditUserId(user.id);
        setEditUser(user);
        setEditUserName(user.name);
    };

    const handleUpdateUser = async () => {
        setIsLoading(true);
        try {
            const userRef = ref(database, 'chat/users/' + editUserId);
            await update(userRef, {
                name: editUserName,
            });

            // Update the local state with the new data
            setUsers((prevUsers) => prevUsers.map((user) =>
                user.id === editUserId ? { ...user, name: editUserName } : user
            ));

            setEditUserId(null); // Exit edit mode
        } catch (error) {
            console.error('Error updating user in Firebase:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm("Are you sure you want to delete this user?")) {
            return; // If the user cancels, stop the deletion
        }

        try {
            const userRef = ref(database, 'chat/users/' + user.id);
            await remove(userRef);
            setUsers(users.filter(u => u.id !== user.id));
            alert("User deleted successfully.");
        } catch (error) {
            console.error("Error deleting user from Firebase:", error);
            alert("Failed to delete user.");
        }
    };

    const handleChangeStatus = async (user) => {
        const newStatus = user.status === "active" ? "inactive" : "active";
        try {
            const userRef = ref(database, 'chat/users/' + user.id);
            await update(userRef, { status: newStatus });
            setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        } catch (error) {
            console.error("Error updating status in Firebase:", error);
            alert("Failed to update status.");
        }
    };

    const handleChangeStatusWithConfirmation = async (user) => {
        if (window.confirm(`Apakah Anda yakin ingin mengubah status ${user.name}?`)){
            // handleChangeStatus(user); 
            await handleChangeStatus(user);
            alert(`Status ${user.name} berhasil diubah.`);
        }
        else{
            alert('Status gagal diubah.');
        }
        
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Reset to the first page on items per page change
    };

    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const getPagination = () => {
        let pages = [];
        
        if (totalPages <= 5) {
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            if (currentPage <= 3) {
                pages = [1, 2, 3, 4, 5, '...'];
            } else if (currentPage >= totalPages - 2) {
                pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
            }
        }
        return pages;
    };

    

    return ( 
        <div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
                <div className="flex justify-between items-center px-4 py-3">
                    <div className="text-xl font-bold mb-4">Daftar Pengguna</div>
                    <div className="relative">
                       <button onClick={toggleForm} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 m-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Add</button>
                           
                        {showForm && (
                            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
                              <div className="bg-white p-6 text-center rounded-lg w-96">
                                {/* "Kembali" Button inside modal */}
                                <button
                                  onClick={toggleForm}
                                  type="button"
                                  className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-4 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                                >
                                  Kembali
                                </button>
                    
                                {/* Form component */}
                                <AddUser />
                              </div>
                            </div>
                          )}
                    </div>

                  
                </div>
                <div className="flex justify-between  px-4 py-3">
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
                    
                    <div className="relative ">
                        <form className="max-w-md mx-auto ml-2"> 
                            <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
                            <div >
                                <input 
                                onChange={handleSearch} 
                                value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
                            </div>
                        </form>
                        
                    </div>
                </div>
               
                <table className="min-w-full bg-white border  border-gray-300">
                    <thead className="border">
                        <tr>
                            <th className="py-2 px-4 ">No</th>
                            {/* <th className="py-2 px-4 ">Nama</th> */}
                            <th  className="text-center md:p-4 p-0">
                                Nama
                                <button onClick={sortByName} className="ml-2">
                                    {sortOrderName === 'asc' ? '↑' : '↓'}
                                </button>
                            </th>
                            <th className="py-2 px-4 ">Status</th>
                            <th className="py-2 px-4 ">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers .length > 0 ? (
                            filteredUsers .map((user,index) => (
                                <tr key={user.id} className=" border">
                                    <td className="py-2 px-4 text-left">
                                        {index+1}
                                       
                                    </td>
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
                                   
                                    <td className="py-2 px-4 text-center">
                                          <button onClick={() => handleChangeStatusWithConfirmation(user)}>
                                            {user.status === 'Active' ? 
                                            <button className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Active</button> : 
                                            <button className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Inactive</button>}
                                        </button>
                                    </td>
                                    
                                   
                                    <td className="py-2 px-4  text-center">
                                        {editUserId === user.id ? (
                                            <>
                                                <button onClick={handleUpdateUser} className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2">
                                                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                                                </button>
                                                <button
                                                    onClick={() => setEditUserId(null)}
                                                    className="bg-gray-500 text-white px-4 py-2 rounded-md "
                                                >
                                                    Batal
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    // className="bg-yellow-500 text-white px-4 py-2 rounded-md mr-2"
                                                    type="button" className="focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-md text-sm px-4 py-2 mr-2 dark:focus:ring-yellow-900"
                                                >
                                                    Edit
                                                </button>
                                            
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    // className="bg-red-500 text-white px-4 py-2 rounded-md"
                                                    type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-md text-sm px-4 py-2  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                                                >
                                                    Hapus
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                            ) : (
                            <tr>
                                <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
                            </tr>
                            )
                        }
                       
                    </tbody>
                </table>

                {totalItems > itemsPerPage && (
                    <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            Page {currentPage} of {totalPages}
                        </span>
                        
                        <ul className="inline-flex items-center -space-x-px">
                            <li>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                            </li>
                            {getPagination().map((page, index) => (
                                <li key={index}>
                                    {page === '...' ? (
                                        <span className="py-2 px-4">...</span>
                                    ) : (
                                        <button
                                            onClick={() => setCurrentPage(page)}
                                            className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
                                        >
                                            {page}
                                        </button>
                                    )}
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
        </div>
    );
};

export default UsersTable;
