"use client";
import Chat0 from '../components/Chat0'; // Sesuaikan path jika berbeda
import { UserProvider } from '../context/UserContext'; // Sesuaikan path jika berbeda
import { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database'; // Firebase database functions

const UserPage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userActive, setUserActive] = useState(false); // Track if the user is active
    const [userName, setUserName] = useState('');

    useEffect(() => {
        // Extract the 'name' (user) from the URL
        const pathParts = window.location.pathname.split('/');
        const nameFromUrl = pathParts[pathParts.length - 1];
        setUserName(nameFromUrl);
        console.log("Name from URL:", nameFromUrl);

        // Fetch user data from Firebase
        const db = getDatabase();
        const usersRef = ref(db, 'chat/users'); // Reference to the users in Firebase

        // Check if the user with the 'id' (nameFromUrl) exists
        get(usersRef).then(snapshot => {
            if (snapshot.exists()) {
                const users = snapshot.val();
                const userKey = Object.keys(users).find(key => key === nameFromUrl); // Cari ID di keys

                if (userKey && users[userKey].status === 'Active') {
                    // User found and is active
                    setUserData(users[userKey]);
                    setUserActive(true);
                } else {
                    // User not found or inactive
                    setUserActive(false);
                }
            } else {
                // No users in the database
                setUserActive(false);
            }
            setLoading(false); // Set loading to false after checking Firebase
        }).catch(error => {
            console.error("Error fetching user data:", error);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div role="status" className="flex justify-center items-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    if (!userActive) {
        return <p>User not found or inactive.</p>;
    }

    return (
        <UserProvider>
            <Chat0 user={{ id: userName, name: userData?.name }} />
        </UserProvider>
    );
};

export default UserPage;
