"use client";
import Chat0 from '../components/Chat0'; // Sesuaikan path jika berbeda
import { UserProvider } from '../context/UserContext'; // Sesuaikan path jika berbeda
import { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database'; // Firebase database functions

const UserPage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userActive, setUserActive] = useState(false);
    const [userName, setUserName] = useState('');
    const [otherUsers, setOtherUsers] = useState([]); // State untuk menyimpan data pengguna lain

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Extract the 'id' from the URL
                const pathParts = window.location.pathname.split('/');
                const idFromUrl = pathParts[pathParts.length - 1];
                setUserName(idFromUrl);
                console.log("ID from URL:", idFromUrl);

                // Initialize Firebase Database reference
                const db = getDatabase();
                const userRef = ref(db, `chat/users/${idFromUrl}`); // Reference to specific user in Firebase

                // Fetch current user data
                const snapshot = await get(userRef);
                
                if (snapshot.exists()) {
                    const user = snapshot.val();
                    console.log("User data:", user);

                    if (user.status === 'Active') {
                        setUserData(user);
                        setUserActive(true);

                        // Fetch all users to populate the sidebar
                        const allUsersRef = ref(db, 'chat/users');
                        const allUsersSnapshot = await get(allUsersRef);

                        if (allUsersSnapshot.exists()) {
                            const allUsersData = allUsersSnapshot.val();
                            const otherUsersArray = Object.keys(allUsersData)
                                .filter(userId => allUsersData[userId].name !== user.name) // Filter out current user
                                .map(userId => ({
                                    id: userId,
                                    name: allUsersData[userId].name,
                                    status: allUsersData[userId].status
                                }));
                            setOtherUsers(otherUsersArray);
                        }
                    } else {
                        setUserActive(false);
                    }
                } else {
                    setUserActive(false); // User not found
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUserActive(false);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <div role="status" className="flex justify-center items-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    if (!userActive || !userData) {
        return <p>User not found or inactive.</p>;
    }

    return (
        <UserProvider>
        
            <div className="flex">
                
                

                <nav class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                  <div class="px-3 py-3 lg:px-5 lg:pl-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center justify-start rtl:justify-end">
                        <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                            <span class="sr-only">Open sidebar</span>
                            <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                               <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                            </svg>
                         </button>
                        <a href="https://flowbite.com" class="flex ms-2 md:me-24">
                            
                          <span class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">Welcome, {userData.name}</span>
                        </a>
                      </div>
                      <div class="flex items-center">
                          <div class="flex items-center ms-3">
                           
                            <div class="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600" id="dropdown-user">
                              <div class="px-4 py-3" role="none">
                                <p class="text-sm text-gray-900 dark:text-white" role="none">
                                  {userData.name}
                                </p>
                              </div>
                              <ul class="py-1" role="none">
                                <li>
                                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">{userData.status}</a>
                                </li>
                                <li>
                                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">{userData.createdAt}</a>
                                </li>
                               
                              </ul>
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                </nav>
                
                <aside id="logo-sidebar" class="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700" aria-label="Sidebar">
                   <div class="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
                      <ul class="space-y-2 font-medium">
                         {/* Menampilkan daftar user selain userName */}
                         {otherUsers.map(user => (
                            <li key={user.id}>
                               <a href={`/${userName}/${user.name}`} class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                  <svg class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                                     <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"/>
                                     <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"/>
                                  </svg>
                                  <span class="ms-3">{user.name}</span>
                               </a>
                               <p class="ms-10 text-sm text-gray-500 dark:text-gray-400">{user.status}</p>
                            </li>
                         ))}
                        
                      </ul>
                   </div>
                </aside>
                
                <div class="p-4 sm:ml-64">
                   <div class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
                            ini halaman
                   </div>
                </div>
               
            </div>
        </UserProvider>
    );
};

export default UserPage;

// "use client";
// import Chat0 from '../components/Chat0'; // Sesuaikan path jika berbeda
// import { UserProvider } from '../context/UserContext'; // Sesuaikan path jika berbeda
// import { useEffect, useState } from 'react';
// import { getDatabase, ref, get } from 'firebase/database'; // Firebase database functions

// const UserPage = () => {
//     const [userData, setUserData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [userActive, setUserActive] = useState(false);
//     const [userName, setUserName] = useState('');

//     useEffect(() => {
//         const fetchUserData = async () => {
//             try {
//                 // Extract the 'id' from the URL
//                 const pathParts = window.location.pathname.split('/');
//                 const idFromUrl = pathParts[pathParts.length - 1];
//                 setUserName(idFromUrl);
//                 console.log("ID from URL:", idFromUrl);

//                 // Initialize Firebase Database reference
//                 const db = getDatabase();
//                 const userRef = ref(db, `chat/users/${idFromUrl}`); // Reference to specific user in Firebase

//                 // Fetch user data from Firebase
//                 const snapshot = await get(userRef);
                
//                 if (snapshot.exists()) {
//                     const user = snapshot.val();
//                     console.log("User data:", user);

//                     // Check if the user is active
//                     if (user.status === 'Active') {
//                         setUserData(user);
//                         setUserActive(true);
//                     } else {
//                         setUserActive(false);
//                     }
//                 } else {
//                     // User not found in Firebase
//                     setUserActive(false);
//                 }
//             } catch (error) {
//                 console.error("Error fetching user data:", error);
//                 setUserActive(false); // Set to false if error occurs
//             } finally {
//                 setLoading(false); // Set loading to false after fetching data
//             }
//         };

//         fetchUserData();
//     }, []);

//     if (loading) {
//         return (
//             <div role="status" className="flex justify-center items-center h-screen">
//                 <p>Loading...</p>
//             </div>
//         );
//     }

//     if (!userActive || !userData) {
//         return <p>User not found or inactive.</p>;
//     }

//     // Ensure userData exists before accessing its properties
//     return (
//         <UserProvider>
//         user;
//         </UserProvider>
//     );
// };

// export default UserPage;
