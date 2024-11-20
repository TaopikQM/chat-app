"use client";
import { useEffect, useState } from "react";
import { getDatabase, ref, get, push, set, onValue } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"; // Import getStorage
import { database, storage } from "../config/firebase"; // Pastikan ini adalah file konfigurasi Firebase Anda
import { UserProvider } from "../context/UserContext"; // Sesuaikan path jika berbeda

const UserPage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userActive, setUserActive] = useState(false);
    const [userName, setUserName] = useState("");
    const [otherUsers, setOtherUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [lastSeen, setLastSeen] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]); // State untuk menyimpan file yang dipilih

    useEffect(() => {
        const fetchUserData = async () => {
            const pathParts = window.location.pathname.split("/");
            const idFromUrl = pathParts[pathParts.length - 1];
            setUserName(idFromUrl);

            const db = getDatabase();
            const userRef = ref(db, `chat/users/${idFromUrl}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const user = snapshot.val();
                if (user.status === "Active") {
                    setUserData(user);
                    setUserActive(true);
                    const allUsersRef = ref(db, "chat/users");
                    const allUsersSnapshot = await get(allUsersRef);

                    if (allUsersSnapshot.exists()) {
                        const allUsersData = allUsersSnapshot.val();
                        const otherUsersArray = Object.keys(allUsersData)
                            .filter(
                                (userId) =>
                                    allUsersData[userId].status === "Active" &&
                                    allUsersData[userId].name !== user.name
                            )
                            .map((userId) => ({
                                id: userId,
                                name: allUsersData[userId].name,
                                status: allUsersData[userId].status,
                            }));
                        setOtherUsers(otherUsersArray);
                    }
                } else {
                    setUserActive(false);
                }
            } else {
                setUserActive(false);
            }
            setLoading(false);
        };

        fetchUserData();
    }, []);

    // Update lastSeen setiap 30 detik
    useEffect(() => {
        if (userData) {
            const db = getDatabase();
            const lastSeenRef = ref(db, `chat/lastseen/${userData.name}`);

            const updateLastSeen = () => {
                const jakartaTime = new Date().toLocaleString("en-US", {
                    timeZone: "Asia/Jakarta",
                    hour12: false,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                });
                set(lastSeenRef, { lastSeen: jakartaTime });
            };

            updateLastSeen(); // Update saat pertama kali
            const interval = setInterval(updateLastSeen, 30000); // Update setiap 30 detik

            return () => clearInterval(interval); // Hapus interval saat komponen di-unmount
        }
    }, [userData]);

    // Memantau pesan antara pengguna saat ini dan pengguna yang dipilih
    useEffect(() => {
        if (selectedUser) {
            const db = getDatabase();
            const messagesRef = ref(db, "chat/messages");

            const unsubscribe = onValue(messagesRef, (snapshot) => {
                if (snapshot.exists()) {
                    const allMessages = snapshot.val();
                    const filteredMessages = Object.keys(allMessages)
                        .map((key) => {
                            const msg = allMessages[key];
                            if (msg.penerima === userData.name && !msg.read) {
                                set(ref(db, `chat/messages/${key}`), {
                                    ...msg,
                                    read: true,
                                });
                            }
                            return { key, ...msg };
                        })
                        .filter(
                            (msg) =>
                                (msg.pengirim === userData.name &&
                                    msg.penerima === selectedUser.name) ||
                                (msg.penerima === userData.name &&
                                    msg.pengirim === selectedUser.name)
                        );

                    setMessages(filteredMessages);
                } else {
                    setMessages([]);
                }
            });

            return () => unsubscribe(); // Hapus listener saat komponen di-unmount
        }
    }, [selectedUser, userData]);

    const handleFileChange = (e) => {
        const files = e.target.files;
        setSelectedFiles(files); // Simpan file yang dipilih
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles((prevFiles) => {
            const updatedFiles = [...prevFiles];
            updatedFiles.splice(index, 1); // Hapus file berdasarkan index
            return updatedFiles;
        });
    };

    const sendMessage = async () => {
        if (!message.trim() && selectedFiles.length === 0) return;

        try {
            const db = getDatabase();
            const storage = getStorage(); // Inisialisasi Firebase Storage
            const messagesRef = ref(db, "chat/messages");

            const jakartaTime = new Date().toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
            });

            let uploadedFiles = [];

            // Jika ada file yang dipilih, unggah ke Firebase Storage
            if (selectedFiles.length > 0) {
                uploadedFiles = await Promise.all(
                    Array.from(selectedFiles).map(async (file) => {
                        const fileRef = storageRef(
                            storage,
                            `chat/chatFiles/${Date.now()}_${file.name}`
                        );
                        await uploadBytes(fileRef, file);
                        const downloadURL = await getDownloadURL(fileRef);
                        return { name: file.name, url: downloadURL };
                    })
                );
            }

            // Buat pesan baru dengan teks dan file yang diunggah
            const newMessage = {
                text: message,
                pengirim: userData.name,
                penerima: selectedUser.name,
                createdAt: jakartaTime,
                read: false,
                files: uploadedFiles,
            };

            // Simpan pesan ke Firebase Realtime Database
            await push(messagesRef, newMessage);

            setMessage(""); // Reset input pesan
            setSelectedFiles([]); // Reset file yang dipilih setelah pesan terkirim
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Gagal mengirim pesan.");
        }
    };

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
                <aside className="w-64 h-screen p-4 bg-gray-100">
                    <h2 className="text-lg font-bold">Pengguna Aktif</h2>
                    <ul>
                        {otherUsers.map((user) => (
                            <li key={user.id}>
                                <button
                                    onClick={() => setSelectedUser(user)}
                                    className={`block p-2 rounded-lg ${
                                        selectedUser?.id === user.id
                                            ? "bg-blue-500 text-white"
                                            : "bg-white"
                                    }`}
                                >
                                    {user.name} ({user.status})
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>
                <div className="flex-1 p-4">
                    {selectedUser ? (
                        <div>
                            <h2 className="text-xl font-bold">
                                Obrolan dengan {selectedUser.name}
                            </h2>
                            {lastSeen && (
                                <p className="text-sm text-gray-500">
                                    Terakhir terlihat: {lastSeen}
                                </p>
                            )}
                            <div className="border p-4 h-[400px] overflow-y-scroll">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`mb-2 p-2 rounded-lg ${
                                            msg.pengirim === userData.name
                                                ? "bg-blue-500 text-white ml-auto w-fit"
                                                : "bg-gray-300 text-black mr-auto w-fit"
                                        }`}
                                    >
                                        <p>{msg.text}</p>
                                        {msg.files &&
                                            msg.files.map((file, fileIndex) => (
                                                <a
                                                    key={fileIndex}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500"
                                                >
                                                    {file.name}
                                                </a>
                                            ))}
                                            
                                        <small>{msg.createdAt}</small>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="mb-2"
                                />
                                <div className="space-x-2">
                                    {selectedFiles.length > 0 && (
                                        <div>
                                            {Array.from(selectedFiles).map(
                                                (file, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center"
                                                    >
                                                        <span>{file.name}</span>
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveFile(
                                                                    index
                                                                )
                                                            }
                                                            className="text-red-500 ml-2"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Ketik pesan..."
                                    className="w-full p-2 border rounded-lg mt-2"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
                                >
                                    Kirim
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p>Pilih pengguna untuk mulai obrolan.</p>
                    )}
                </div>
            </div>
        </UserProvider>
    );
};

export default UserPage;


// "use client";

// import { useEffect, useState } from "react";
// import { getDatabase, ref, get, push, set, onValue } from "firebase/database";
// import { ref as getStorage,storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// import { database, storage } from "../config/firebase";
// import { UserProvider } from "../context/UserContext"; // Sesuaikan path jika berbeda

// const UserPage = () => {
//     const [userData, setUserData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [userActive, setUserActive] = useState(false);
//     const [userName, setUserName] = useState("");
//     const [otherUsers, setOtherUsers] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [message, setMessage] = useState("");
//     const [messages, setMessages] = useState([]);
//     const [lastSeen, setLastSeen] = useState("");
//     const [selectedFiles, setSelectedFiles] = useState([]); // State untuk menyimpan file yang dipilih

//     useEffect(() => {
//         const fetchUserData = async () => {
//             // Ambil data pengguna dari URL
//             const pathParts = window.location.pathname.split("/");
//             const idFromUrl = pathParts[pathParts.length - 1];
//             setUserName(idFromUrl);

//             const db = getDatabase();
//             const userRef = ref(db, `chat/users/${idFromUrl}`);
//             const snapshot = await get(userRef);

//             if (snapshot.exists()) {
//                 const user = snapshot.val();
//                 if (user.status === "Active") {
//                     setUserData(user);
//                     setUserActive(true);
//                     const allUsersRef = ref(db, "chat/users");
//                     const allUsersSnapshot = await get(allUsersRef);

//                     if (allUsersSnapshot.exists()) {
//                         const allUsersData = allUsersSnapshot.val();
//                         const otherUsersArray = Object.keys(allUsersData)
//                             .filter(
//                                 (userId) =>
//                                     allUsersData[userId].status === "Active" &&
//                                     allUsersData[userId].name !== user.name
//                             )
//                             .map((userId) => ({
//                                 id: userId,
//                                 name: allUsersData[userId].name,
//                                 status: allUsersData[userId].status,
//                             }));
//                         setOtherUsers(otherUsersArray);
//                     }
//                 } else {
//                     setUserActive(false);
//                 }
//             } else {
//                 setUserActive(false);
//             }
//             setLoading(false);
//         };

//         fetchUserData();
//     }, []);

//     // Update lastSeen setiap 30 detik
//     useEffect(() => {
//         if (userData) {
//             const db = getDatabase();
//             const lastSeenRef = ref(db, `chat/lastseen/${userData.name}`);

//             const updateLastSeen = () => {
//                 const jakartaTime = new Date().toLocaleString("en-US", {
//                     timeZone: "Asia/Jakarta",
//                     hour12: false,
//                     year: "numeric",
//                     month: "2-digit",
//                     day: "2-digit",
//                     hour: "2-digit",
//                     minute: "2-digit",
//                     second: "2-digit",
//                 });
//                 set(lastSeenRef, { lastSeen: jakartaTime });
//             };

//             updateLastSeen(); // Update saat pertama kali
//             const interval = setInterval(updateLastSeen, 30000); // Update setiap 30 detik

//             return () => clearInterval(interval); // Hapus interval saat komponen di-unmount
//         }
//     }, [userData]);

//     // Memantau pesan antara pengguna saat ini dan pengguna yang dipilih
//     useEffect(() => {
//         if (selectedUser) {
//             const db = getDatabase();
//             const messagesRef = ref(db, "chat/messages");

//             const unsubscribe = onValue(messagesRef, (snapshot) => {
//                 if (snapshot.exists()) {
//                     const allMessages = snapshot.val();
//                     const filteredMessages = Object.keys(allMessages)
//                         .map((key) => {
//                             const msg = allMessages[key];
//                             if (msg.penerima === userData.name && !msg.read) {
//                                 set(ref(db, `chat/messages/${key}`), {
//                                     ...msg,
//                                     read: true,
//                                 });
//                             }
//                             return { key, ...msg };
//                         })
//                         .filter(
//                             (msg) =>
//                                 (msg.pengirim === userData.name &&
//                                     msg.penerima === selectedUser.name) ||
//                                 (msg.penerima === userData.name &&
//                                     msg.pengirim === selectedUser.name)
//                         );

//                     setMessages(filteredMessages);
//                 } else {
//                     setMessages([]);
//                 }
//             });

//             return () => unsubscribe(); // Hapus listener saat komponen di-unmount
//         }
//     }, [selectedUser, userData]);

//     const handleFileChange = (e) => {
//         const files = e.target.files;
//         setSelectedFiles(files); // Simpan file yang dipilih
//     };

//     const handleRemoveFile = (index) => {
//         setSelectedFiles((prevFiles) => {
//             const updatedFiles = [...prevFiles];
//             updatedFiles.splice(index, 1); // Hapus file berdasarkan index
//             return updatedFiles;
//         });
//     };

//     const sendMessage = async () => {
//         if (!message.trim() && selectedFiles.length === 0) return;

//         try {
//             const db = getDatabase();
//             // const storage = getStorage(); // Inisialisasi Firebase Storage
//             const messagesRef = ref(db, "chat/messages");

//             const jakartaTime = new Date().toLocaleString("id-ID", {
//                 timeZone: "Asia/Jakarta",
//             });

//             let uploadedFiles = [];

//             // Jika ada file yang dipilih, unggah ke Firebase Storage
//             if (selectedFiles.length > 0) {
//                 uploadedFiles = await Promise.all(
//                     Array.from(selectedFiles).map(async (file) => {
//                         const fileRef = storageRef(
//                             storage,
//                             `chat/chatFiles/${Date.now()}_${file.name}`
//                         );
//                         await uploadBytes(fileRef, file);
//                         const downloadURL = await getDownloadURL(fileRef);
//                         return { name: file.name, url: downloadURL };
//                     })
//                 );
//             }

//             // Buat pesan baru dengan teks dan file yang diunggah
//             const newMessage = {
//                 text: message,
//                 pengirim: userData.name,
//                 penerima: selectedUser.name,
//                 createdAt: jakartaTime,
//                 read: false,
//                 files: uploadedFiles,
//             };

//             // Simpan pesan ke Firebase Realtime Database
//             await push(messagesRef, newMessage);

//             setMessage(""); // Reset input pesan
//             setSelectedFiles([]); // Reset file yang dipilih setelah pesan terkirim
//         } catch (error) {
//             console.error("Error sending message:", error);
//             alert("Gagal mengirim pesan.");
//         }
//     };

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

//     return (
//         <UserProvider>
//             <div className="flex">
//                 <aside className="w-64 h-screen p-4 bg-gray-100">
//                     <h2 className="text-lg font-bold">Pengguna Aktif</h2>
//                     <ul>
//                         {otherUsers.map((user) => (
//                             <li key={user.id}>
//                                 <button
//                                     onClick={() => setSelectedUser(user)}
//                                     className={`block p-2 rounded-lg ${
//                                         selectedUser?.id === user.id
//                                             ? "bg-blue-500 text-white"
//                                             : "bg-white"
//                                     }`}
//                                 >
//                                     {user.name} ({user.status})
//                                 </button>
//                             </li>
//                         ))}
//                     </ul>
//                 </aside>
//                 <div className="flex-1 p-4">
//                     {selectedUser ? (
//                         <div>
//                             <h2 className="text-xl font-bold">
//                                 Obrolan dengan {selectedUser.name}
//                             </h2>
//                             {lastSeen && (
//                                 <p className="text-sm text-gray-500">
//                                     Terakhir terlihat: {lastSeen}
//                                 </p>
//                             )}
//                             <div className="border p-4 h-[400px] overflow-y-scroll">
//                                 {messages.map((msg, index) => (
//                                     <div
//                                         key={index}
//                                         className={`mb-2 p-2 rounded-lg ${
//                                             msg.pengirim === userData.name
//                                                 ? "bg-blue-500 text-white ml-auto w-fit"
//                                                 : "bg-gray-300 text-black mr-auto w-fit"
//                                         }`}
//                                     >
//                                         <p>{msg.text}</p>
//                                         {msg.files &&
//                                             msg.files.map((file, i) => (
//                                                 <div key={i} className="mt-2">
//                                                     <a
//                                                         href={file.url}
//                                                         target="_blank"
//                                                         rel="noopener noreferrer"
//                                                         className="text-blue-500"
//                                                     >
//                                                         {file.name}
//                                                     </a>
//                                                 </div>
//                                             ))}
//                                         <small>{msg.createdAt}</small>
//                                     </div>
//                                 ))}
//                             </div>
//                             <div className="flex items-center mt-4">
//                                 <input
//                                     type="text"
//                                     value={message}
//                                     onChange={(e) => setMessage(e.target.value)}
//                                     placeholder="Tulis pesan..."
//                                     className="border p-2 flex-1 rounded-lg"
//                                 />
//                                 <input
//                                     type="file"
//                                     multiple
//                                     onChange={handleFileChange}
//                                     className="ml-2"
//                                 />
//                                 {selectedFiles.length > 0 && (
//                                     <div className="ml-2">
//                                         <p>File yang dipilih:</p>
//                                         <ul>
//                                             {Array.from(selectedFiles).map(
//                                                 (file, index) => (
//                                                     <li key={index} className="flex items-center">
//                                                         <span>{file.name}</span>
//                                                         <button
//                                                             onClick={() =>
//                                                                 handleRemoveFile(index)
//                                                             }
//                                                             className="ml-2 text-red-500"
//                                                         >
//                                                             X
//                                                         </button>
//                                                     </li>
//                                                 )
//                                             )}
//                                         </ul>
//                                     </div>
//                                 )}
//                                 <button
//                                     onClick={sendMessage}
//                                     className="ml-4 p-2 bg-blue-500 text-white rounded-lg"
//                                 >
//                                     Kirim
//                                 </button>
//                             </div>
//                         </div>
//                     ) : (
//                         <p>Pilih pengguna untuk memulai percakapan.</p>
//                     )}
//                 </div>
//             </div>
//         </UserProvider>
//     );
// };

// export default UserPage;

// // "use client";

// // import { useEffect, useState } from "react";
// // import {
// //     getDatabase,
// //     ref,
// //     get,
// //     push,
// //     set,
// //     onValue,
// //     serverTimestamp,
// // } from "firebase/database";
// // import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// // import { database, storage } from "../config/firebase";

// // const UserPage = () => {
// //     const [userData, setUserData] = useState(null);
// //     const [loading, setLoading] = useState(true);
// //     const [userActive, setUserActive] = useState(false);
// //     const [userName, setUserName] = useState("");
// //     const [otherUsers, setOtherUsers] = useState([]);
// //     const [selectedUser, setSelectedUser] = useState(null);
// //     const [message, setMessage] = useState("");
// //     const [messages, setMessages] = useState([]);
// //     const [lastSeen, setLastSeen] = useState("");
// //     const [selectedFilesPreview, setSelectedFilesPreview] = useState([]);

// //     useEffect(() => {
// //         const fetchUserData = async () => {
// //             try {
// //                 const pathParts = window.location.pathname.split("/");
// //                 const idFromUrl = pathParts[pathParts.length - 1];
// //                 setUserName(idFromUrl);

// //                 const db = getDatabase();
// //                 const userRef = ref(db, `chat/users/${idFromUrl}`);

// //                 const snapshot = await get(userRef);
// //                 if (snapshot.exists()) {
// //                     const user = snapshot.val();
// //                     if (user.status === "Active") {
// //                         setUserData(user);
// //                         setUserActive(true);

// //                         const allUsersRef = ref(db, "chat/users");
// //                         const allUsersSnapshot = await get(allUsersRef);
// //                         if (allUsersSnapshot.exists()) {
// //                             const allUsersData = allUsersSnapshot.val();
// //                             const otherUsersArray = Object.keys(allUsersData)
// //                                 .filter(
// //                                     (userId) =>
// //                                         allUsersData[userId].status === "Active" &&
// //                                         allUsersData[userId].name !== user.name
// //                                 )
// //                                 .map((userId) => ({
// //                                     id: userId,
// //                                     name: allUsersData[userId].name,
// //                                     status: allUsersData[userId].status,
// //                                 }));
// //                             setOtherUsers(otherUsersArray);
// //                         }
// //                     } else {
// //                         setUserActive(false);
// //                     }
// //                 } else {
// //                     setUserActive(false);
// //                 }
// //             } catch (error) {
// //                 console.error("Error fetching user data:", error);
// //                 setUserActive(false);
// //             } finally {
// //                 setLoading(false);
// //             }
// //         };

// //         fetchUserData();
// //     }, []);

// //     const handleFileChange = (e) => {
// //         const files = Array.from(e.target.files);
// //         const previews = files.map((file) => ({
// //             file,
// //             name: file.name,
// //             url: URL.createObjectURL(file),
// //         }));
// //         setSelectedFilesPreview(previews);
// //     };

// //     const removeFile = (index) => {
// //         const updatedFiles = [...selectedFilesPreview];
// //         updatedFiles.splice(index, 1);
// //         setSelectedFilesPreview(updatedFiles);
// //     };

// //     const sendMessage = async () => {
// //         if (!message.trim() && selectedFilesPreview.length === 0) return;

// //         try {
// //             const db = getDatabase();
// //             const messagesRef = ref(db, "chat/messages");

// //             const jakartaTime = new Date().toLocaleString("id-ID", {
// //                 timeZone: "Asia/Jakarta",
// //             });

// //             let uploadedFiles = [];

// //             if (selectedFilesPreview.length > 0) {
// //                 uploadedFiles = await Promise.all(
// //                     selectedFilesPreview.map(async (filePreview) => {
// //                         const fileRef = storageRef(storage, `chat/chatFiles/${Date.now()}_${filePreview.name}`);
// //                         await uploadBytes(fileRef, filePreview.file);
// //                         const downloadURL = await getDownloadURL(fileRef);
// //                         return { name: filePreview.name, url: downloadURL };
// //                     })
// //                 );
// //             }

// //             const newMessage = {
// //                 text: message,
// //                 pengirim: userData.name,
// //                 penerima: selectedUser.name,
// //                 createdAt: jakartaTime,
// //                 read: false,
// //                 files: uploadedFiles,
// //             };

// //             await push(messagesRef, newMessage);

// //             setMessage("");
// //             setSelectedFilesPreview([]); // Reset file preview
// //         } catch (error) {
// //             console.error("Error sending message:", error);
// //             alert("Gagal mengirim pesan.");
// //         }
// //     };

// //     if (loading) {
// //         return <p>Loading...</p>;
// //     }

// //     if (!userActive || !userData) {
// //         return <p>User not found or inactive.</p>;
// //     }

// //     return (
// //         <div className="flex">
// //             <aside className="w-64 p-4 bg-gray-100">
// //                 <h2>Pengguna Aktif</h2>
// //                 <ul>
// //                     {otherUsers.map((user) => (
// //                         <li key={user.id}>
// //                             <button
// //                                 onClick={() => setSelectedUser(user)}
// //                                 className={selectedUser?.id === user.id ? "bg-blue-500" : ""}
// //                             >
// //                                 {user.name}
// //                             </button>
// //                         </li>
// //                     ))}
// //                 </ul>
// //             </aside>
// //             <div className="flex-1 p-4">
// //                 {selectedUser ? (
// //                     <div>
// //                         <h2>Obrolan dengan {selectedUser.name}</h2>
// //                         <div>
// //                             <div>
// //                                 {messages.map((msg, index) => (
// //                                     <div key={index}>
// //                                         <p>{msg.text}</p>
// //                                         {msg.files?.map((file, i) => (
// //                                             <a key={i} href={file.url}>
// //                                                 {file.name}
// //                                             </a>
// //                                         ))}
// //                                     </div>
// //                                 ))}
// //                             </div>
// //                             <div>
// //                                 {selectedFilesPreview.map((preview, index) => (
// //                                     <div key={index} className="flex items-center">
// //                                         <img
// //                                             src={preview.url}
// //                                             alt={preview.name}
// //                                             className="w-10 h-10"
// //                                         />
// //                                         <p>{preview.name}</p>
// //                                         <button onClick={() => removeFile(index)}>X</button>
// //                                     </div>
// //                                 ))}
// //                                 <input type="file" multiple onChange={handleFileChange} />
// //                                 <textarea
// //                                     value={message}
// //                                     onChange={(e) => setMessage(e.target.value)}
// //                                 />
// //                                 <button onClick={sendMessage}>Kirim</button>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 ) : (
// //                     <p>Pilih pengguna untuk mulai mengobrol.</p>
// //                 )}
// //             </div>
// //         </div>
// //     );
// // };

// // export default UserPage;

// // // "use client";

// // // import Chat0 from "../components/Chat0"; // Sesuaikan path jika berbeda
// // // import { UserProvider } from "../context/UserContext"; // Sesuaikan path jika berbeda
// // // import { useEffect, useState } from "react";
// // // import {
// // //     getDatabase,
// // //     ref,
// // //     get,
// // //     push,
// // //     set,
// // //     onValue,
// // //     serverTimestamp,
// // // } from "firebase/database"; // Firebase database functions

// // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// // // import { database, storage } from '../config/firebase';

// // // const UserPage = () => {
// // //     const [userData, setUserData] = useState(null);
// // //     const [loading, setLoading] = useState(true);
// // //     const [userActive, setUserActive] = useState(false);
// // //     const [userName, setUserName] = useState("");
// // //     const [otherUsers, setOtherUsers] = useState([]);
// // //     const [selectedUser, setSelectedUser] = useState(null);
// // //     const [message, setMessage] = useState("");
// // //     const [messages, setMessages] = useState([]); // Daftar pesan
// // //     const [lastSeen, setLastSeen] = useState(""); // Last seen pengguna terpilih

// // //     useEffect(() => {
// // //         const fetchUserData = async () => {
// // //             try {
// // //                 const pathParts = window.location.pathname.split("/");
// // //                 const idFromUrl = pathParts[pathParts.length - 1];
// // //                 setUserName(idFromUrl);

// // //                 const db = getDatabase();
// // //                 const userRef = ref(db, `chat/users/${idFromUrl}`);

// // //                 const snapshot = await get(userRef);

// // //                 if (snapshot.exists()) {
// // //                     const user = snapshot.val();
// // //                     if (user.status === "Active") {
// // //                         setUserData(user);
// // //                         setUserActive(true);

// // //                         const allUsersRef = ref(db, "chat/users");
// // //                         const allUsersSnapshot = await get(allUsersRef);

// // //                         if (allUsersSnapshot.exists()) {
// // //                             const allUsersData = allUsersSnapshot.val();
// // //                             const otherUsersArray = Object.keys(allUsersData)
// // //                                 .filter(
// // //                                     (userId) =>
// // //                                         allUsersData[userId].status === "Active" &&
// // //                                         allUsersData[userId].name !== user.name
// // //                                 )
// // //                                 .map((userId) => ({
// // //                                     id: userId,
// // //                                     name: allUsersData[userId].name,
// // //                                     status: allUsersData[userId].status,
// // //                                 }));
// // //                             setOtherUsers(otherUsersArray);
// // //                         }
// // //                     } else {
// // //                         setUserActive(false);
// // //                     }
// // //                 } else {
// // //                     setUserActive(false);
// // //                 }
// // //             } catch (error) {
// // //                 console.error("Error fetching user data:", error);
// // //                 setUserActive(false);
// // //             } finally {
// // //                 setLoading(false);
// // //             }
// // //         };

// // //         fetchUserData();
// // //     }, []);

// // //     // Update lastSeen setiap 30 detik
// // //     useEffect(() => {
// // //         if (userData) {
// // //             const db = getDatabase();
// // //             const lastSeenRef = ref(db, `chat/lastseen/${userData.name}`);

// // //             const updateLastSeen = () => {
// // //                 const jakartaTime = new Date().toLocaleString("en-US", {
// // //                     timeZone: "Asia/Jakarta",
// // //                     hour12: false,
// // //                     year: "numeric",
// // //                     month: "2-digit",
// // //                     day: "2-digit",
// // //                     hour: "2-digit",
// // //                     minute: "2-digit",
// // //                     second: "2-digit",
// // //                 });
// // //                 set(lastSeenRef, { lastSeen: jakartaTime });
// // //             };

// // //             updateLastSeen(); // Update saat pertama kali
// // //             const interval = setInterval(updateLastSeen, 30000); // Update setiap 30 detik

// // //             return () => clearInterval(interval); // Hapus interval saat komponen di-unmount
// // //         }
// // //     }, [userData]);

// // //     // Memantau perubahan lastSeen pengguna yang dipilih
// // //     useEffect(() => {
// // //         if (selectedUser) {
// // //             const db = getDatabase();
// // //             const lastSeenRef = ref(db, `chat/lastseen/${selectedUser.name}`);

// // //             const unsubscribe = onValue(lastSeenRef, (snapshot) => {
// // //                 if (snapshot.exists()) {
// // //                     setLastSeen(snapshot.val().lastSeen);
// // //                 } else {
// // //                     setLastSeen("Tidak tersedia");
// // //                 }
// // //             });

// // //             return () => unsubscribe(); // Hapus listener saat komponen di-unmount
// // //         }
// // //     }, [selectedUser]);

// // //     // Memantau pesan antara pengguna saat ini dan pengguna yang dipilih
// // //     useEffect(() => {
// // //         if (selectedUser) {
// // //             const db = getDatabase();
// // //             const messagesRef = ref(db, "chat/messages");

// // //             const unsubscribe = onValue(messagesRef, (snapshot) => {
// // //                 if (snapshot.exists()) {
// // //                     const allMessages = snapshot.val();
// // //                     const filteredMessages = Object.keys(allMessages)
// // //                         .map((key) => {
// // //                             const msg = allMessages[key];
// // //                             if (msg.penerima === userData.name && !msg.read) {
// // //                                 set(ref(db, `chat/messages/${key}`), {
// // //                                     ...msg,
// // //                                     read: true,
// // //                                 });
// // //                             }
// // //                             return { key, ...msg };
// // //                         })
// // //                         .filter(
// // //                             (msg) =>
// // //                                 (msg.pengirim === userData.name &&
// // //                                     msg.penerima === selectedUser.name) ||
// // //                                 (msg.penerima === userData.name &&
// // //                                     msg.pengirim === selectedUser.name)
// // //                         );

// // //                     setMessages(filteredMessages);
// // //                 } else {
// // //                     setMessages([]);
// // //                 }
// // //             });

// // //             return () => unsubscribe(); // Hapus listener saat komponen di-unmount
// // //         }
// // //     }, [selectedUser, userData]);
    
// // //     const handleFileChange = async (e) => {
// // //     const files = e.target.files;
// // //     await sendMessage(files); // Kirim file yang dipilih
// // // };


// // //    const sendMessage = async (selectedFiles = []) => {
// // //     if (!message.trim() && selectedFiles.length === 0) return;

// // //     try {
// // //         const db = getDatabase();
// // //         const storage = getStorage(); // Inisialisasi Firebase Storage
// // //         const messagesRef = ref(db, "chat/messages");

// // //         const jakartaTime = new Date().toLocaleString("id-ID", {
// // //             timeZone: "Asia/Jakarta",
// // //         });

// // //         let uploadedFiles = [];

// // //         // Jika ada file yang dipilih, unggah ke Firebase Storage
// // //         if (selectedFiles.length > 0) {
// // //             uploadedFiles = await Promise.all(
// // //                 Array.from(selectedFiles).map(async (file) => {
// // //                     const fileRef = storageRef(storage, `chat/chatFiles/${Date.now()}_${file.name}`);
// // //                     await uploadBytes(fileRef, file);
// // //                     const downloadURL = await getDownloadURL(fileRef);
// // //                     return { name: file.name, url: downloadURL };
// // //                 })
// // //             );
// // //         }

// // //         // Buat pesan baru dengan teks dan file yang diunggah
// // //         const newMessage = {
// // //             text: message,
// // //             pengirim: userData.name,
// // //             penerima: selectedUser.name,
// // //             createdAt: jakartaTime,
// // //             read: false,
// // //             files: uploadedFiles,
// // //         };

// // //         // Simpan pesan ke Firebase Realtime Database
// // //         await push(messagesRef, newMessage);

// // //         setMessage(""); // Reset input pesan
// // //     } catch (error) {
// // //         console.error("Error sending message:", error);
// // //         alert("Gagal mengirim pesan.");
// // //     }
// // // };

// // //     if (loading) {
// // //         return (
// // //             <div role="status" className="flex justify-center items-center h-screen">
// // //                 <p>Loading...</p>
// // //             </div>
// // //         );
// // //     }

// // //     if (!userActive || !userData) {
// // //         return <p>User not found or inactive.</p>;
// // //     }

// // //     return (
// // //         <UserProvider>
// // //             <div className="flex">
// // //                 <aside className="w-64 h-screen p-4 bg-gray-100">
// // //                     <h2 className="text-lg font-bold">Pengguna Aktif</h2>
// // //                     <ul>
// // //                         {otherUsers.map((user) => (
// // //                             <li key={user.id}>
// // //                                 <button
// // //                                     onClick={() => setSelectedUser(user)}
// // //                                     className={`block p-2 rounded-lg ${
// // //                                         selectedUser?.id === user.id
// // //                                             ? "bg-blue-500 text-white"
// // //                                             : "bg-white"
// // //                                     }`}
// // //                                 >
// // //                                     {user.name} ({user.status})
// // //                                 </button>
// // //                             </li>
// // //                         ))}
// // //                     </ul>
// // //                 </aside>
// // //                 <div className="flex-1 p-4">
// // //                     {selectedUser ? (
// // //                         <div>
// // //                             <h2 className="text-xl font-bold">
// // //                                 Obrolan dengan {selectedUser.name}
// // //                             </h2>
// // //                             {lastSeen && (
// // //                                 <p className="text-sm text-gray-500">
// // //                                     Terakhir terlihat: {lastSeen}
// // //                                 </p>
// // //                             )}
// // //                             <div className="border p-4 h-[400px] overflow-y-scroll">
// // //                                 {messages.map((msg, index) => (
// // //                                     <div
// // //                                         key={index}
// // //                                         className={`mb-2 p-2 rounded-lg ${
// // //                                             msg.pengirim === userData.name
// // //                                                 ? "bg-blue-500 text-white ml-auto w-fit"
// // //                                                 : "bg-gray-300 text-black mr-auto w-fit"
// // //                                         }`}
// // //                                     >
// // //                                         <p>{msg.text}</p>
// // //                                         {msg.files &&
// // //                                             msg.files.map((file, i) => (
// // //                                                 <a
// // //                                                     key={i}
// // //                                                     href={file.url}
// // //                                                     target="_blank"
// // //                                                     rel="noopener noreferrer"
// // //                                                     className="text-blue-500 underline"
// // //                                                 >
// // //                                                     File: {file.name}
// // //                                                 </a>
// // //                                             ))}
// // //                                         <span className="text-xs text-gray-500">
// // //                                             {msg.createdAt}
// // //                                         </span>
// // //                                         {msg.pengirim === userData.name && (
// // //                                             <span className="text-xs ml-2">
// // //                                                 {msg.read ? "✔✔" : "✔"}
// // //                                             </span>
// // //                                         )}
// // //                                     </div>
// // //                                 ))}
// // //                             </div>
// // //                             <div className="mt-4 flex items-center gap-2">
// // //                                      {/* Tombol untuk upload file */}
// // //                                 <label
// // //                                     htmlFor="file_upload"
// // //                                     className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300"
// // //                                 >
// // //                                     📎
// // //                                 </label>
// // //                                 <input
// // //                                     id="file_upload"
// // //                                     type="file"
// // //                                     multiple
// // //                                     className="hidden"
// // //                                      onChange={handleFileChange}
// // //                                 />
// // //                                 <textarea
// // //                                     className="w-full p-2 border rounded-lg"
// // //                                     rows="4"
// // //                                     value={message}
// // //                                     onChange={(e) => setMessage(e.target.value)}
// // //                                     placeholder="Tulis pesan..."
// // //                                 />
                                 
// // //                                 <button
// // //                                     onClick={sendMessage}
// // //                                     className="px-4 py-2 mt-2 text-white bg-blue-500 rounded-lg"
// // //                                 >
// // //                                     Kirim
// // //                                 </button>
// // //                             </div>
// // //                         </div>
// // //                     ) : (
// // //                         <p>Pilih pengguna dari sidebar untuk mulai mengobrol.</p>
// // //                     )}
// // //                 </div>
// // //             </div>
// // //         </UserProvider>
// // //     );
// // // };

// // // export default UserPage;

// // // // "use client";

// // // // import Chat0 from "../components/Chat0"; // Sesuaikan path jika berbeda
// // // // import { UserProvider } from "../context/UserContext"; // Sesuaikan path jika berbeda
// // // // import { useEffect, useState } from "react";
// // // // import { getDatabase, ref, get, push, set, onValue, serverTimestamp } from "firebase/database"; // Firebase database functions

// // // // const UserPage = () => {
// // // //     const [userData, setUserData] = useState(null);
// // // //     const [loading, setLoading] = useState(true);
// // // //     const [userActive, setUserActive] = useState(false);
// // // //     const [userName, setUserName] = useState("");
// // // //     const [otherUsers, setOtherUsers] = useState([]);
// // // //     const [selectedUser, setSelectedUser] = useState(null);
// // // //     const [message, setMessage] = useState("");
// // // //     const [messages, setMessages] = useState([]); // Daftar pesan
// // // //     const [lastSeen, setLastSeen] = useState(""); // Last seen pengguna terpilih

// // // //     useEffect(() => {
// // // //         const fetchUserData = async () => {
// // // //             try {
// // // //                 const pathParts = window.location.pathname.split("/");
// // // //                 const idFromUrl = pathParts[pathParts.length - 1];
// // // //                 setUserName(idFromUrl);

// // // //                 const db = getDatabase();
// // // //                 const userRef = ref(db, `chat/users/${idFromUrl}`);

// // // //                 const snapshot = await get(userRef);

// // // //                 if (snapshot.exists()) {
// // // //                     const user = snapshot.val();
// // // //                     if (user.status === "Active") {
// // // //                         setUserData(user);
// // // //                         setUserActive(true);

// // // //                         const allUsersRef = ref(db, "chat/users");
// // // //                         const allUsersSnapshot = await get(allUsersRef);

// // // //                         if (allUsersSnapshot.exists()) {
// // // //                             const allUsersData = allUsersSnapshot.val();
// // // //                             const otherUsersArray = Object.keys(allUsersData)
// // // //                                 .filter(
// // // //                                     (userId) =>
// // // //                                         allUsersData[userId].status === "Active" &&
// // // //                                         allUsersData[userId].name !== user.name
// // // //                                 )
// // // //                                 .map((userId) => ({
// // // //                                     id: userId,
// // // //                                     name: allUsersData[userId].name,
// // // //                                     status: allUsersData[userId].status,
// // // //                                 }));
// // // //                             setOtherUsers(otherUsersArray);
// // // //                         }

                        
// // // //                     } else {
// // // //                         setUserActive(false);
// // // //                     }
// // // //                 } else {
// // // //                     setUserActive(false);
// // // //                 }
// // // //             } catch (error) {
// // // //                 console.error("Error fetching user data:", error);
// // // //                 setUserActive(false);
// // // //             } finally {
// // // //                 setLoading(false);
// // // //             }
// // // //         };

// // // //         fetchUserData();
// // // //     }, []);

// // // //     // Update lastSeen setiap 30 detik
// // // //    // Update lastSeen setiap 30 detik
// // // //     useEffect(() => {
// // // //         if (userData) {
// // // //             const db = getDatabase();
// // // //             const lastSeenRef = ref(db, `chat/lastseen/${userData.name}`);
    
// // // //             const updateLastSeen = () => {
// // // //                 const jakartaTime = new Date().toLocaleString("en-US", {
// // // //                     timeZone: "Asia/Jakarta",
// // // //                     hour12: false,
// // // //                     year: 'numeric',
// // // //                     month: '2-digit',
// // // //                     day: '2-digit',
// // // //                     hour: '2-digit',
// // // //                     minute: '2-digit',
// // // //                     second: '2-digit',
// // // //                 });
// // // //                 set(lastSeenRef, { lastSeen: jakartaTime });
// // // //             };
    
// // // //             updateLastSeen(); // Update saat pertama kali
// // // //             const interval = setInterval(updateLastSeen, 30000); // Update setiap 30 detik
    
// // // //             return () => clearInterval(interval); // Hapus interval saat komponen di-unmount
// // // //         }
// // // //     }, [userData]);

// // // //     useEffect(() => {
// // // //     if (selectedUser) {
// // // //         const db = getDatabase();
// // // //         const lastSeenRef = ref(db, `chat/lastseen/${selectedUser.name}`);
        
// // // //         // Pantau perubahan lastSeen dari Firebase
// // // //         const unsubscribe = onValue(lastSeenRef, (snapshot) => {
// // // //             if (snapshot.exists()) {
// // // //                 setLastSeen(snapshot.val().lastSeen);
// // // //             } else {
// // // //                 setLastSeen("Tidak tersedia");
// // // //             }
// // // //         });

// // // //         return () => unsubscribe(); // Hapus listener saat komponen di-unmount
// // // //     }
// // // // }, [selectedUser]);


// // // //     useEffect(() => {
// // // //         if (selectedUser) {
// // // //             const db = getDatabase();

            

// // // //             // Pantau pesan yang melibatkan pengguna saat ini dan pengguna terpilih
// // // //             const messagesRef = ref(db, "chat/messages");
// // // //             const unsubscribe = onValue(messagesRef, (snapshot) => {
// // // //                 if (snapshot.exists()) {
// // // //                     const allMessages = snapshot.val();
// // // //                     const filteredMessages = Object.values(allMessages)
// // // //                         .map((key) => {
// // // //                     const msg = allMessages[key];
// // // //                     // Perbarui status `read` jika penerima adalah pengguna saat ini
// // // //                      if (msg && msg.penerima && msg.pengirim) {
// // // //                             // Tandai pesan sebagai telah dibaca jika penerima adalah pengguna saat ini
// // // //                             if (msg.penerima === userData.name && !msg.read) {
// // // //                                 set(ref(db, `chat/messages/${key}`), {
// // // //                                     ...msg,
// // // //                                     read: true,
// // // //                                 });
// // // //                             }
// // // //                             return { key, ...msg }; // Tambahkan kunci ke pesan
// // // //                         }
// // // //                         return null; // Abaikan pesan yang tidak valid
// // // //                     })
// // // //                     .filter((msg) => {
// // // //                         return (
// // // //                             msg &&
// // // //                             ((msg.pengirim === userData.name && msg.penerima === selectedUser.name) ||
// // // //                                 (msg.penerima === userData.name && msg.pengirim === selectedUser.name))
// // // //                         );
// // // //                     });
// // // //                     setMessages(filteredMessages);
// // // //                 } else {
// // // //                     setMessages([]);
// // // //                 }
// // // //             });

// // // //             return () => unsubscribe(); // Hapus listener saat komponen di-unmount
// // // //         }
// // // //     }, [selectedUser, userData]);

// // // //     const sendMessage = async () => {
// // // //         if (!message.trim()) return;

// // // //         try {
// // // //             const db = getDatabase();
// // // //             const messagesRef = ref(db, "chat/messages");

// // // //             const jakartaTime = new Date().toLocaleString("id-ID", {
// // // //                 timeZone: "Asia/Jakarta",
// // // //             });

// // // //             // Simpan data pesan di Firebase
// // // //             await push(messagesRef, {
// // // //                 text: message,
// // // //                 pengirim: userData.name,
// // // //                 penerima: selectedUser.name,
// // // //                 createdAt: jakartaTime,
// // // //                 read: false,
// // // //                 files: [],
// // // //             });

// // // //             setMessage(""); // Reset input pesan
// // // //         } catch (error) {
// // // //             console.error("Error sending message:", error);
// // // //             alert("Gagal mengirim pesan.");
// // // //         }
// // // //     };

// // // //     if (loading) {
// // // //         return (
// // // //             <div role="status" className="flex justify-center items-center h-screen">
// // // //                 <p>Loading...</p>
// // // //             </div>
// // // //         );
// // // //     }

// // // //     if (!userActive || !userData) {
// // // //         return <p>User not found or inactive.</p>;
// // // //     }

// // // //     return (
// // // //         <UserProvider>
// // // //             <div className="flex">
// // // //                 <aside className="w-64 h-screen p-4 bg-gray-100">
// // // //                     <h2 className="text-lg font-bold">Pengguna Aktif</h2>
// // // //                     <ul>
// // // //                         {otherUsers.map((user) => (
// // // //                             <li key={user.id}>
// // // //                                 <button
// // // //                                     onClick={() => setSelectedUser(user)}
// // // //                                     className={`block p-2 rounded-lg ${
// // // //                                         selectedUser?.id === user.id
// // // //                                             ? "bg-blue-500 text-white"
// // // //                                             : "bg-white"
// // // //                                     }`}
// // // //                                 >
// // // //                                     {user.name} ({user.status})
// // // //                                 </button>
// // // //                             </li>
// // // //                         ))}
// // // //                     </ul>
// // // //                 </aside>
// // // //                 <div className="flex-1 p-4">
// // // //                     {selectedUser ? (
// // // //                         <div>
// // // //                             <h2 className="text-xl font-bold">Obrolan dengan {selectedUser.name}</h2>
// // // //                              {lastSeen && (
// // // //                                 <p className="text-sm text-gray-500">Terakhir terlihat: {lastSeen}</p>
// // // //                             )}
// // // //                             <div className="border p-4 h-[400px] overflow-y-scroll">
// // // //                                 {messages.map((msg, index) => (
// // // //                                     <div
// // // //                                         key={index}
// // // //                                         className={`mb-2 p-2 rounded-lg ${
// // // //                                             msg.pengirim === userData.name
// // // //                                                 ? "bg-blue-500 text-white ml-auto w-fit"
// // // //                                                 : "bg-gray-300 text-black mr-auto w-fit"
// // // //                                         }`}
// // // //                                     >
// // // //                                         <p>{msg.text}</p>
// // // //                                         {/* Menampilkan file jika ada */}
// // // //                                         {msg.file && (
// // // //                                             <div className="mt-2">
// // // //                                                 {msg.file.endsWith(".jpg") || msg.file.endsWith(".png") || msg.file.endsWith(".gif") ? (
// // // //                                                     // Menampilkan gambar
// // // //                                                     <img
// // // //                                                         src={msg.file}
// // // //                                                         alt="Media"
// // // //                                                         className="object-cover h-40 w-40 rounded-lg"
// // // //                                                     />
// // // //                                                 ) : (
// // // //                                                     // Menampilkan label file untuk tipe lain
// // // //                                                     <a
// // // //                                                         href={msg.file}
// // // //                                                         target="_blank"
// // // //                                                         rel="noopener noreferrer"
// // // //                                                         className="text-sm text-blue-600 underline"
// // // //                                                     >
// // // //                                                         Lihat File
// // // //                                                     </a>
// // // //                                                 )}
// // // //                                             </div>
// // // //                                         )}

// // // //                                         <span className="text-xs text-gray-500">
// // // //                                             {msg.createdAt}
// // // //                                         </span>
// // // //                                          {msg.pengirim === userData.name && (
// // // //                                             <span className="text-xs ml-2">
// // // //                                                 {msg.read ? "✔✔" : "✔"} {/* Indikator centang */}
// // // //                                             </span>
// // // //                                         )}
// // // //                                     </div>
// // // //                                 ))}
// // // //                             </div>
// // // //                             <div className="mt-4 flex items-center gap-2">
// // // //                                      {/* Tombol untuk upload file */}
// // // //                                 <label
// // // //                                     htmlFor="file_upload"
// // // //                                     className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300"
// // // //                                 >
// // // //                                     {/* Ikon klip */}
// // // //                                     📎
// // // //                                 </label>
                            
// // // //                                 {/* Input file tersembunyi */}
// // // //                                 <input
// // // //                                     id="file_upload"
// // // //                                     type="file"
// // // //                                     multiple
// // // //                                     className="hidden"
// // // //                                     onChange={(e) => {
// // // //                                         const files = e.target.files;
// // // //                                         // Lakukan sesuatu dengan file yang dipilih
// // // //                                         console.log(files);
// // // //                                     }}
// // // //                                 />
// // // //                                 <textarea
// // // //                                     className="w-full p-2 border rounded-lg"
// // // //                                     rows="4"
// // // //                                     value={message}
// // // //                                     onChange={(e) => setMessage(e.target.value)}
// // // //                                     placeholder="Tulis pesan..."
// // // //                                 />
// // // //                                 <button
// // // //                                     onClick={sendMessage}
// // // //                                     className="px-4 py-2 mt-2 text-white bg-blue-500 rounded-lg"
// // // //                                 >
// // // //                                     Kirim
// // // //                                 </button>
// // // //                             </div>
// // // //                         </div>
// // // //                     ) : (
// // // //                         <p>Pilih pengguna dari sidebar untuk mulai mengobrol.</p>
// // // //                     )}
// // // //                 </div>
// // // //             </div>
// // // //         </UserProvider>
// // // //     );
// // // // };

// // // // export default UserPage;

// // // // // "use client";

// // // // // import Chat0 from "../components/Chat0"; // Sesuaikan path jika berbeda
// // // // // import { UserProvider } from "../context/UserContext"; // Sesuaikan path jika berbeda
// // // // // import { useEffect, useState } from "react";
// // // // // import { getDatabase, ref, get, push, set, onValue } from "firebase/database"; // Firebase database functions

// // // // // const UserPage = () => {
// // // // //     const [userData, setUserData] = useState(null);
// // // // //     const [loading, setLoading] = useState(true);
// // // // //     const [userActive, setUserActive] = useState(false);
// // // // //     const [userName, setUserName] = useState("");
// // // // //     const [otherUsers, setOtherUsers] = useState([]);
// // // // //     const [selectedUser, setSelectedUser] = useState(null);
// // // // //     const [message, setMessage] = useState("");
// // // // //     const [messages, setMessages] = useState([]); // State untuk menyimpan daftar pesan

// // // // //     useEffect(() => {
// // // // //         const fetchUserData = async () => {
// // // // //             try {
// // // // //                 const pathParts = window.location.pathname.split("/");
// // // // //                 const idFromUrl = pathParts[pathParts.length - 1];
// // // // //                 setUserName(idFromUrl);

// // // // //                 const db = getDatabase();
// // // // //                 const userRef = ref(db, `chat/users/${idFromUrl}`);

// // // // //                 const snapshot = await get(userRef);

// // // // //                 if (snapshot.exists()) {
// // // // //                     const user = snapshot.val();
// // // // //                     if (user.status === "Active") {
// // // // //                         setUserData(user);
// // // // //                         setUserActive(true);

// // // // //                         const allUsersRef = ref(db, "chat/users");
// // // // //                         const allUsersSnapshot = await get(allUsersRef);

// // // // //                         if (allUsersSnapshot.exists()) {
// // // // //                             const allUsersData = allUsersSnapshot.val();
// // // // //                             const otherUsersArray = Object.keys(allUsersData)
// // // // //                                 .filter(
// // // // //                                     (userId) =>
// // // // //                                         allUsersData[userId].status === "Active" &&
// // // // //                                         allUsersData[userId].name !== user.name
// // // // //                                 )
// // // // //                                 .map((userId) => ({
// // // // //                                     id: userId,
// // // // //                                     name: allUsersData[userId].name,
// // // // //                                     status: allUsersData[userId].status,
// // // // //                                 }));
// // // // //                             setOtherUsers(otherUsersArray);
// // // // //                         }

// // // // //                         // Update last seen
// // // // //                         const lastSeenRef = ref(db, `chat/lastseen/${user.name}`);
// // // // //                         const jakartaTime = new Date().toLocaleTimeString("en-US", {
// // // // //                             timeZone: "Asia/Jakarta",
// // // // //                             hour12: false,
// // // // //                         });
// // // // //                         set(lastSeenRef, { lastSeen: jakartaTime });
// // // // //                     } else {
// // // // //                         setUserActive(false);
// // // // //                     }
// // // // //                 } else {
// // // // //                     setUserActive(false);
// // // // //                 }
// // // // //             } catch (error) {
// // // // //                 console.error("Error fetching user data:", error);
// // // // //                 setUserActive(false);
// // // // //             } finally {
// // // // //                 setLoading(false);
// // // // //             }
// // // // //         };

// // // // //         fetchUserData();
// // // // //     }, []);

// // // // //     const sendMessage = async () => {
// // // // //         if (!message.trim()) return;

// // // // //         try {
// // // // //             const db = getDatabase();
// // // // //             const messagesRef = ref(db, "chat/messages");

// // // // //             // Format waktu sebagai string
// // // // //             const jakartaTime = new Date().toLocaleTimeString("en-US", {
// // // // //                 timeZone: "Asia/Jakarta",
// // // // //                 hour12: false,
// // // // //             });

// // // // //             // Simpan data pesan di Firebase
// // // // //             await push(messagesRef, {
// // // // //                 text: message,
// // // // //                 pengirim: userData.name,
// // // // //                 penerima: selectedUser.name,
// // // // //                 createdAt: jakartaTime, // Waktu dalam format string
// // // // //                 read: false,
// // // // //             });

// // // // //             setMessage(""); // Reset input pesan
// // // // //         } catch (error) {
// // // // //             console.error("Error sending message:", error);
// // // // //             alert("Gagal mengirim pesan.");
// // // // //         }
// // // // //     };

// // // // //     useEffect(() => {
// // // // //         if (selectedUser) {
// // // // //             const db = getDatabase();
// // // // //             const messagesRef = ref(db, "chat/messages");

// // // // //             // Pantau pesan yang melibatkan pengguna saat ini dan pengguna terpilih
// // // // //             const unsubscribe = onValue(messagesRef, (snapshot) => {
// // // // //                 if (snapshot.exists()) {
// // // // //                     const allMessages = snapshot.val();
// // // // //                     const filteredMessages = Object.values(allMessages).filter(
// // // // //                         (msg) =>
// // // // //                             (msg.pengirim === userData.name &&
// // // // //                                 msg.penerima === selectedUser.name) ||
// // // // //                             (msg.penerima === userData.name &&
// // // // //                                 msg.pengirim === selectedUser.name)
// // // // //                     );
// // // // //                     setMessages(filteredMessages);
// // // // //                 } else {
// // // // //                     setMessages([]);
// // // // //                 }
// // // // //             });

// // // // //             return () => unsubscribe(); // Hapus listener saat komponen di-unmount
// // // // //         }
// // // // //     }, [selectedUser, userData]);

// // // // //     if (loading) {
// // // // //         return (
// // // // //             <div role="status" className="flex justify-center items-center h-screen">
// // // // //                 <p>Loading...</p>
// // // // //             </div>
// // // // //         );
// // // // //     }

// // // // //     if (!userActive || !userData) {
// // // // //         return <p>User not found or inactive.</p>;
// // // // //     }

// // // // //     return (
// // // // //         <UserProvider>
// // // // //             <div className="flex">
// // // // //                 <aside className="w-64 h-screen p-4 bg-gray-100">
// // // // //                     <h2 className="text-lg font-bold">Pengguna Aktif</h2>
// // // // //                     <ul>
// // // // //                         {otherUsers.map((user) => (
// // // // //                             <li key={user.id}>
// // // // //                                 <button
// // // // //                                     onClick={() => setSelectedUser(user)}
// // // // //                                     className={`block p-2 rounded-lg ${
// // // // //                                         selectedUser?.id === user.id
// // // // //                                             ? "bg-blue-500 text-white"
// // // // //                                             : "bg-white"
// // // // //                                     }`}
// // // // //                                 >
// // // // //                                     {user.name} ({user.status})
// // // // //                                 </button>
// // // // //                             </li>
// // // // //                         ))}
// // // // //                     </ul>
// // // // //                 </aside>
// // // // //                 <div className="flex-1 p-4">
// // // // //                     {selectedUser ? (
// // // // //                         <div>
// // // // //                             <h2 className="text-xl font-bold">Obrolan dengan {selectedUser.name}</h2>
// // // // //                             <div className="border p-4 h-[400px] overflow-y-scroll">
// // // // //                                 {messages.map((msg, index) => (
// // // // //                                     <div
// // // // //                                         key={index}
// // // // //                                         className={`mb-2 p-2 rounded-lg ${
// // // // //                                             msg.pengirim === userData.name
// // // // //                                                 ? "bg-blue-500 text-white ml-auto w-fit"
// // // // //                                                 : "bg-gray-300 text-black mr-auto w-fit"
// // // // //                                         }`}
// // // // //                                     >
// // // // //                                         <p>{msg.text}</p>
// // // // //                                         <span className="text-xs">
// // // // //                                             {msg.createdAt}
// // // // //                                         </span>
// // // // //                                     </div>
// // // // //                                 ))}
// // // // //                             </div>
// // // // //                             <div className="mt-4">
// // // // //                                 <textarea
// // // // //                                     className="w-full p-2 border rounded-lg"
// // // // //                                     rows="4"
// // // // //                                     value={message}
// // // // //                                     onChange={(e) => setMessage(e.target.value)}
// // // // //                                     placeholder="Tulis pesan..."
// // // // //                                 />
// // // // //                                 <button
// // // // //                                     onClick={sendMessage}
// // // // //                                     className="px-4 py-2 mt-2 text-white bg-blue-500 rounded-lg"
// // // // //                                 >
// // // // //                                     Kirim
// // // // //                                 </button>
// // // // //                             </div>
// // // // //                         </div>
// // // // //                     ) : (
// // // // //                         <p>Pilih pengguna dari sidebar untuk mulai mengobrol.</p>
// // // // //                     )}
// // // // //                 </div>
// // // // //             </div>
// // // // //         </UserProvider>
// // // // //     );
// // // // // };

// // // // // export default UserPage;

// // // // // // "use client";
// // // // // // import Chat0 from "../components/Chat0"; // Sesuaikan path jika berbeda
// // // // // // import { UserProvider } from "../context/UserContext"; // Sesuaikan path jika berbeda
// // // // // // import { useEffect, useState } from "react";
// // // // // // import { getDatabase, ref, get, push, serverTimestamp } from "firebase/database"; // Firebase database functions

// // // // // // const UserPage = () => {
// // // // // //     const [userData, setUserData] = useState(null);
// // // // // //     const [loading, setLoading] = useState(true);
// // // // // //     const [userActive, setUserActive] = useState(false);
// // // // // //     const [userName, setUserName] = useState("");
// // // // // //     const [otherUsers, setOtherUsers] = useState([]);
// // // // // //     const [selectedUser, setSelectedUser] = useState(null);
// // // // // //     const [message, setMessage] = useState(""); // State untuk menyimpan input pesan

// // // // // //     useEffect(() => {
// // // // // //         const fetchUserData = async () => {
// // // // // //             try {
// // // // // //                 const pathParts = window.location.pathname.split("/");
// // // // // //                 const idFromUrl = pathParts[pathParts.length - 1];
// // // // // //                 setUserName(idFromUrl);

// // // // // //                 const db = getDatabase();
// // // // // //                 const userRef = ref(db, `chat/users/${idFromUrl}`);

// // // // // //                 const snapshot = await get(userRef);

// // // // // //                 if (snapshot.exists()) {
// // // // // //                     const user = snapshot.val();
// // // // // //                     if (user.status === "Active") {
// // // // // //                         setUserData(user);
// // // // // //                         setUserActive(true);

// // // // // //                         const allUsersRef = ref(db, "chat/users");
// // // // // //                         const allUsersSnapshot = await get(allUsersRef);

// // // // // //                         if (allUsersSnapshot.exists()) {
// // // // // //                             const allUsersData = allUsersSnapshot.val();
// // // // // //                             const otherUsersArray = Object.keys(allUsersData)
// // // // // //                                 .filter(
// // // // // //                                     (userId) =>
// // // // // //                                         allUsersData[userId].status === "Active" &&
// // // // // //                                         allUsersData[userId].name !== user.name
// // // // // //                                 )
// // // // // //                                 .map((userId) => ({
// // // // // //                                     id: userId,
// // // // // //                                     name: allUsersData[userId].name,
// // // // // //                                     status: allUsersData[userId].status,
// // // // // //                                 }));
// // // // // //                             setOtherUsers(otherUsersArray);
// // // // // //                         }
// // // // // //                     } else {
// // // // // //                         setUserActive(false);
// // // // // //                     }
// // // // // //                 } else {
// // // // // //                     setUserActive(false);
// // // // // //                 }
// // // // // //             } catch (error) {
// // // // // //                 console.error("Error fetching user data:", error);
// // // // // //                 setUserActive(false);
// // // // // //             } finally {
// // // // // //                 setLoading(false);
// // // // // //             }
// // // // // //         };

// // // // // //         fetchUserData();
// // // // // //     }, []);

// // // // // //     const sendMessage = async () => {
// // // // // //         if (!message.trim()) return; // Jangan kirim pesan kosong

// // // // // //         try {
// // // // // //             const db = getDatabase();
// // // // // //             const messagesRef = ref(db, "chat/messages");

// // // // // //             // Simpan data pesan di Firebase
// // // // // //             await push(messagesRef, {
// // // // // //                 text: message,
// // // // // //                 files: null, // Bisa diatur jika ingin mendukung lampiran
// // // // // //                 pengirim: userData.name,
// // // // // //                 penerima: selectedUser.name,
// // // // // //                 createdAt: serverTimestamp(), // Waktu Firebase
// // // // // //                 read: false,
// // // // // //             });

// // // // // //             setMessage(""); // Reset input pesan
// // // // // //             alert(`Pesan terkirim ke ${selectedUser.name}`);
// // // // // //         } catch (error) {
// // // // // //             console.error("Error sending message:", error);
// // // // // //             alert("Gagal mengirim pesan.");
// // // // // //         }
// // // // // //     };

// // // // // //     if (loading) {
// // // // // //         return (
// // // // // //             <div role="status" className="flex justify-center items-center h-screen">
// // // // // //                 <p>Loading...</p>
// // // // // //             </div>
// // // // // //         );
// // // // // //     }

// // // // // //     if (!userActive || !userData) {
// // // // // //         return <p>User not found or inactive.</p>;
// // // // // //     }

// // // // // //     return (
// // // // // //         <UserProvider>
// // // // // //             <div className="flex">
// // // // // //                 <aside className="w-64 h-screen p-4 bg-gray-100">
// // // // // //                     <h2 className="text-lg font-bold">Pengguna Aktif</h2>
// // // // // //                     <ul>
// // // // // //                         {otherUsers.map((user) => (
// // // // // //                             <li key={user.id}>
// // // // // //                                 <button
// // // // // //                                     onClick={() => setSelectedUser(user)}
// // // // // //                                     className={`block p-2 rounded-lg ${
// // // // // //                                         selectedUser?.id === user.id
// // // // // //                                             ? "bg-blue-500 text-white"
// // // // // //                                             : "bg-white"
// // // // // //                                     }`}
// // // // // //                                 >
// // // // // //                                     {user.name} ({user.status})
// // // // // //                                 </button>
// // // // // //                             </li>
// // // // // //                         ))}
// // // // // //                     </ul>
// // // // // //                 </aside>
// // // // // //                 <div className="flex-1 p-4">
// // // // // //                     {selectedUser ? (
// // // // // //                         <div>
// // // // // //                             <h2 className="text-xl font-bold">Obrolan dengan {selectedUser.name}</h2>
// // // // // //                             <div className="mt-4">
// // // // // //                                 <textarea
// // // // // //                                     className="w-full p-2 border rounded-lg"
// // // // // //                                     rows="4"
// // // // // //                                     value={message}
// // // // // //                                     onChange={(e) => setMessage(e.target.value)}
// // // // // //                                     placeholder="Tulis pesan..."
// // // // // //                                 />
// // // // // //                                 <button
// // // // // //                                     onClick={sendMessage}
// // // // // //                                     className="px-4 py-2 mt-2 text-white bg-blue-500 rounded-lg"
// // // // // //                                 >
// // // // // //                                     Kirim
// // // // // //                                 </button>
// // // // // //                             </div>
// // // // // //                         </div>
// // // // // //                     ) : (
// // // // // //                         <p>Pilih pengguna dari sidebar untuk mulai mengobrol.</p>
// // // // // //                     )}
// // // // // //                 </div>
// // // // // //             </div>
// // // // // //         </UserProvider>
// // // // // //     );
// // // // // // };

// // // // // // export default UserPage;

// // // // // // // "use client";
// // // // // // // import Chat0 from '../components/Chat0'; // Sesuaikan path jika berbeda
// // // // // // // import { UserProvider } from '../context/UserContext'; // Sesuaikan path jika berbeda
// // // // // // // import { useEffect, useState } from 'react';
// // // // // // // import { getDatabase, ref, get } from 'firebase/database'; // Firebase database functions

// // // // // // // const UserPage = () => {
// // // // // // //     const [userData, setUserData] = useState(null);
// // // // // // //     const [loading, setLoading] = useState(true);
// // // // // // //     const [userActive, setUserActive] = useState(false);
// // // // // // //     const [userName, setUserName] = useState('');
// // // // // // //     const [otherUsers, setOtherUsers] = useState([]); // State untuk menyimpan data pengguna lain
// // // // // // //     const [selectedUser, setSelectedUser] = useState(null); // State untuk pengguna yang dipilih


// // // // // // //    useEffect(() => {
// // // // // // //     const fetchUserData = async () => {
// // // // // // //         try {
// // // // // // //             // Extract the 'id' from the URL
// // // // // // //             const pathParts = window.location.pathname.split('/');
// // // // // // //             const idFromUrl = pathParts[pathParts.length - 1];
// // // // // // //             setUserName(idFromUrl);
// // // // // // //             console.log("ID from URL:", idFromUrl);

// // // // // // //             // Initialize Firebase Database reference
// // // // // // //             const db = getDatabase();
// // // // // // //             const userRef = ref(db, `chat/users/${idFromUrl}`); // Reference to specific user in Firebase

// // // // // // //             // Fetch current user data
// // // // // // //             const snapshot = await get(userRef);
            
// // // // // // //             if (snapshot.exists()) {
// // // // // // //                 const user = snapshot.val();
// // // // // // //                 console.log("User data:", user);

// // // // // // //                 if (user.status === 'Active') {
// // // // // // //                     setUserData(user);
// // // // // // //                     setUserActive(true);

// // // // // // //                     // Fetch all users to populate the sidebar
// // // // // // //                     const allUsersRef = ref(db, 'chat/users');
// // // // // // //                     const allUsersSnapshot = await get(allUsersRef);

// // // // // // //                     if (allUsersSnapshot.exists()) {
// // // // // // //                         const allUsersData = allUsersSnapshot.val();
// // // // // // //                         const otherUsersArray = Object.keys(allUsersData)
// // // // // // //                             .filter(userId => 
// // // // // // //                                 allUsersData[userId].status === 'Active' && // Only include active users
// // // // // // //                                 allUsersData[userId].name !== user.name    // Exclude current user
// // // // // // //                             )
// // // // // // //                             .map(userId => ({
// // // // // // //                                 id: userId,
// // // // // // //                                 name: allUsersData[userId].name,
// // // // // // //                                 status: allUsersData[userId].status
// // // // // // //                             }));
// // // // // // //                         setOtherUsers(otherUsersArray);
// // // // // // //                     }
// // // // // // //                 } else {
// // // // // // //                     setUserActive(false);
// // // // // // //                 }
// // // // // // //             } else {
// // // // // // //                 setUserActive(false); // User not found
// // // // // // //             }
// // // // // // //         } catch (error) {
// // // // // // //             console.error("Error fetching user data:", error);
// // // // // // //             setUserActive(false);
// // // // // // //         } finally {
// // // // // // //             setLoading(false);
// // // // // // //         }
// // // // // // //     };

// // // // // // //     fetchUserData();
// // // // // // // }, []);


// // // // // // //     if (loading) {
// // // // // // //         return (
// // // // // // //             <div role="status" className="flex justify-center items-center h-screen">
// // // // // // //                 <p>Loading...</p>
// // // // // // //             </div>
// // // // // // //         );
// // // // // // //     }

// // // // // // //     if (!userActive || !userData) {
// // // // // // //         return <p>User not found or inactive.</p>;
// // // // // // //     }

// // // // // // //     return (
// // // // // // //         <UserProvider>
        
// // // // // // //             <div className="flex">
                
                

// // // // // // //                 <nav class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
// // // // // // //                   <div class="px-3 py-3 lg:px-5 lg:pl-3">
// // // // // // //                     <div class="flex items-center justify-between">
// // // // // // //                       <div class="flex items-center justify-start rtl:justify-end">
// // // // // // //                         <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
// // // // // // //                             <span class="sr-only">Open sidebar</span>
// // // // // // //                             <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
// // // // // // //                                <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
// // // // // // //                             </svg>
// // // // // // //                          </button>
// // // // // // //                         <a href="https://flowbite.com" class="flex ms-2 md:me-24">
                            
// // // // // // //                           <span class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">Welcome, {userData.name}</span>
// // // // // // //                         </a>
// // // // // // //                       </div>
// // // // // // //                       <div class="flex items-center">
// // // // // // //                           <div class="flex items-center ms-3">
                           
// // // // // // //                             <div class="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600" id="dropdown-user">
// // // // // // //                               <div class="px-4 py-3" role="none">
// // // // // // //                                 <p class="text-sm text-gray-900 dark:text-black" role="none">
// // // // // // //                                   {userData.name}
// // // // // // //                                 </p>
// // // // // // //                               </div>
// // // // // // //                               <ul class="py-1" role="none">
// // // // // // //                                 <li>
// // // // // // //                                   <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">{userData.status}</a>
// // // // // // //                                 </li>
// // // // // // //                                 <li>
// // // // // // //                                   <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">{userData.createdAt}</a>
// // // // // // //                                 </li>
                               
// // // // // // //                               </ul>
// // // // // // //                             </div>
// // // // // // //                           </div>
// // // // // // //                         </div>
// // // // // // //                     </div>
// // // // // // //                   </div>
// // // // // // //                 </nav>
                
// // // // // // //                 <aside id="logo-sidebar" class="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700" aria-label="Sidebar">
// // // // // // //                    <div class="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
// // // // // // //                       <ul class="space-y-2 font-medium">
// // // // // // //                          {/* Menampilkan daftar user selain userName */}
// // // // // // //                           {otherUsers.map(user => (
// // // // // // //                                 <li key={user.id}>
// // // // // // //                                     <button
// // // // // // //                                         onClick={() => setSelectedUser(user)} // Simpan pengguna yang dipilih
// // // // // // //                                         className={`flex items-center p-2 rounded-lg group ${
// // // // // // //                                             selectedUser?.id === user.id
// // // // // // //                                                 ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
// // // // // // //                                                 : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
// // // // // // //                                         }`}
// // // // // // //                                     >
// // // // // // //                                         <svg
// // // // // // //                                             className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
// // // // // // //                                             aria-hidden="true"
// // // // // // //                                             xmlns="http://www.w3.org/2000/svg"
// // // // // // //                                             fill="currentColor"
// // // // // // //                                             viewBox="0 0 22 21"
// // // // // // //                                         >
// // // // // // //                                             <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
// // // // // // //                                             <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
// // // // // // //                                         </svg>
// // // // // // //                                         <span className="ms-3">{user.name}</span>
// // // // // // //                                     </button>
// // // // // // //                                     <p className="ms-10 text-sm text-gray-500 dark:text-gray-400">{user.status}</p>
// // // // // // //                                 </li>
// // // // // // //                             ))}

                        
// // // // // // //                       </ul>
// // // // // // //                    </div>
// // // // // // //                 </aside>
                
// // // // // // //                 <div class="p-4 sm:ml-64">
// // // // // // //                    <div class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
// // // // // // //                             ini halaman
// // // // // // //                           {selectedUser ? (
// // // // // // //                                 <div>
// // // // // // //                                     <h2 className="text-lg font-bold text-gray-900 dark:text-gray-700">
// // // // // // //                                         {selectedUser.name}
// // // // // // //                                     </h2>
// // // // // // //                                     <p className="text-sm text-gray-600 dark:text-gray-400">
// // // // // // //                                         Status: {selectedUser.status}
// // // // // // //                                     </p>
// // // // // // //                                 </div>
// // // // // // //                             ) : (
// // // // // // //                                 <p className="text-gray-600 dark:text-gray-400">
// // // // // // //                                     Pilih pengguna dari sidebar untuk melihat detail.
// // // // // // //                                 </p>
// // // // // // //                             )}
// // // // // // //                    </div>
// // // // // // //                 </div>
               
// // // // // // //             </div>
// // // // // // //         </UserProvider>
// // // // // // //     );
// // // // // // // };

// // // // // // // export default UserPage;

// // // // // // // // "use client";
// // // // // // // // import Chat0 from '../components/Chat0'; // Sesuaikan path jika berbeda
// // // // // // // // import { UserProvider } from '../context/UserContext'; // Sesuaikan path jika berbeda
// // // // // // // // import { useEffect, useState } from 'react';
// // // // // // // // import { getDatabase, ref, get } from 'firebase/database'; // Firebase database functions

// // // // // // // // const UserPage = () => {
// // // // // // // //     const [userData, setUserData] = useState(null);
// // // // // // // //     const [loading, setLoading] = useState(true);
// // // // // // // //     const [userActive, setUserActive] = useState(false);
// // // // // // // //     const [userName, setUserName] = useState('');

// // // // // // // //     useEffect(() => {
// // // // // // // //         const fetchUserData = async () => {
// // // // // // // //             try {
// // // // // // // //                 // Extract the 'id' from the URL
// // // // // // // //                 const pathParts = window.location.pathname.split('/');
// // // // // // // //                 const idFromUrl = pathParts[pathParts.length - 1];
// // // // // // // //                 setUserName(idFromUrl);
// // // // // // // //                 console.log("ID from URL:", idFromUrl);

// // // // // // // //                 // Initialize Firebase Database reference
// // // // // // // //                 const db = getDatabase();
// // // // // // // //                 const userRef = ref(db, `chat/users/${idFromUrl}`); // Reference to specific user in Firebase

// // // // // // // //                 // Fetch user data from Firebase
// // // // // // // //                 const snapshot = await get(userRef);
                
// // // // // // // //                 if (snapshot.exists()) {
// // // // // // // //                     const user = snapshot.val();
// // // // // // // //                     console.log("User data:", user);

// // // // // // // //                     // Check if the user is active
// // // // // // // //                     if (user.status === 'Active') {
// // // // // // // //                         setUserData(user);
// // // // // // // //                         setUserActive(true);
// // // // // // // //                     } else {
// // // // // // // //                         setUserActive(false);
// // // // // // // //                     }
// // // // // // // //                 } else {
// // // // // // // //                     // User not found in Firebase
// // // // // // // //                     setUserActive(false);
// // // // // // // //                 }
// // // // // // // //             } catch (error) {
// // // // // // // //                 console.error("Error fetching user data:", error);
// // // // // // // //                 setUserActive(false); // Set to false if error occurs
// // // // // // // //             } finally {
// // // // // // // //                 setLoading(false); // Set loading to false after fetching data
// // // // // // // //             }
// // // // // // // //         };

// // // // // // // //         fetchUserData();
// // // // // // // //     }, []);

// // // // // // // //     if (loading) {
// // // // // // // //         return (
// // // // // // // //             <div role="status" className="flex justify-center items-center h-screen">
// // // // // // // //                 <p>Loading...</p>
// // // // // // // //             </div>
// // // // // // // //         );
// // // // // // // //     }

// // // // // // // //     if (!userActive || !userData) {
// // // // // // // //         return <p>User not found or inactive.</p>;
// // // // // // // //     }

// // // // // // // //     // Ensure userData exists before accessing its properties
// // // // // // // //     return (
// // // // // // // //         <UserProvider>
// // // // // // // //         user;
// // // // // // // //         </UserProvider>
// // // // // // // //     );
// // // // // // // // };

// // // // // // // // export default UserPage;
