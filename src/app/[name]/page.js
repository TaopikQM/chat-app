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

                // Fetch user data from Firebase
                const snapshot = await get(userRef);
                
                if (snapshot.exists()) {
                    const user = snapshot.val();
                    console.log("User data:", user);

                    // Check if the user is active
                    if (user.status === 'Active') {
                        setUserData(user);
                        setUserActive(true);
                    } else {
                        setUserActive(false);
                    }
                } else {
                    // User not found in Firebase
                    setUserActive(false);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUserActive(false); // Set to false if error occurs
            } finally {
                setLoading(false); // Set loading to false after fetching data
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

    // Ensure userData exists before accessing its properties
    return (
        <UserProvider>
        user;
        </UserProvider>
    );
};

export default UserPage;
