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
        // Extract the 'id' from the URL
        const pathParts = window.location.pathname.split('/');
        const idFromUrl = pathParts[pathParts.length - 1];
        setUserName(idFromUrl);
        console.log("ID from URL:", idFromUrl);

        // Fetch user data from Firebase
        const db = getDatabase();
        const userRef = ref(db, `chat/users/${idFromUrl}`); // Reference to specific user in Firebase

        // Check if the user with the 'id' (idFromUrl) exists
        get(userRef).then(snapshot => {
            if (snapshot.exists()) {
                const user = snapshot.val();

                // Check if the user is active
                if (user.status === 'Active') {
                    setUserData(user);
                    setUserActive(true);
                } else {
                    setUserActive(false);
                }
            } else {
                // User not found
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
