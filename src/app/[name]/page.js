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
        // Check if the nameFromUrl is valid (not empty or null)
if (nameFromUrl) {
  // Set the username if it's valid
  setUserName(nameFromUrl);
  console.log("Name from URL:", nameFromUrl);

  // Reference to Firebase Realtime Database
  const usersRef = ref(db, 'chat/users');
  
  // Fetch the users from the database
  get(usersRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const users = snapshot.val(); // Get all users

        // Check if the user with the specific nameFromUrl exists in the database
        const user = users[nameFromUrl];
        
        if (user) {
          // User found, check if active or do something else
          if (user.active) {
            console.log('User is active:', user);
            // Do something with the user data if active
          } else {
            console.log('User is inactive');
          }
        } else {
          console.log('User not found in database');
        }
      } else {
        console.log('No users found in the database');
      }
    })
    .catch((error) => {
      console.error('Error fetching users from Firebase:', error);
    });
} else {
  console.error('Invalid user ID from URL');
}
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
