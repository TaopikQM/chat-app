"use client";
import Chat0 from '../components/Chat0'; // Sesuaikan path jika berbeda
import { UserProvider } from '../context/UserContext'; // Sesuaikan path jika berbeda
import { useEffect, useState } from 'react';
import { database } from '../config/firebase';
import { ref as databaseRef, get, child } from 'firebase/database';

const getRandomColor = () => {
  const colors = ['purple-600', 'pink-600', 'yellow-400', 'red-600', 'green-500', 'gray-600', 'blue-600']; // Define the colors
  return colors[Math.floor(Math.random() * colors.length)];
};

const UserPage = ({name}) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [spinnerColor, setSpinnerColor] = useState('');

    useEffect(() => {
        setSpinnerColor(getRandomColor()); // Set random color on component mount
    }, []);

    useEffect(() => {
        if (name) {
            // Referensi ke data pengguna di Firebase
            const usersRef = databaseRef(database, 'chat/users');

            get(child(usersRef, name))
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        setUserData(snapshot.val());
                    } else {
                        console.log('No data available');
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [name]);

    


    if (!userData) {
        return <p>User not found.</p>;
    }

    return ( 
        <UserProvider>
           <h1>uji</h1>
          <Chat0 user={{ id: name, name: userData.name }} />
        </UserProvider>
    );
};

export default UserPage;
