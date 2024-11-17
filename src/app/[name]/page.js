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
                {/* Sidebar */}
                <div className="w-1/4 p-4 bg-gray-100 border-r border-gray-300">
                    <h2 className="text-lg font-bold mb-4">Other Users</h2>
                    <ul>
                        {otherUsers.map(user => (
                            <li key={user.id} className="mb-2">
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm">Status: {user.status}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Main content */}
                <div className="flex-grow p-4">
                    <h1>Welcome, {userData.name}</h1>
                    <p>Status: {userData.status}</p>
                    {/* You can place the Chat0 component or other user-specific content here */}
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
