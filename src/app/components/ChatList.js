import { useEffect, useState, useRef  } from "react";
import { database } from "../config/firebase";
import { ref as databaseRef, onValue,update,get } from "firebase/database";
import { format } from "date-fns";

import { id } from "date-fns/locale";

import { getStorage, ref as storageRef, getMetadata } from "firebase/storage";
import ChatMessage from "./ChatMessage";

const storage = getStorage();

const ChatList = ({ user1, user2, setReplyMessage  }) => {
  const [messages, setMessages] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef(null);
 
  const [activeCall, setActiveCall] = useState(null); // Status video call
  const messagesEndRef = useRef(null); // Ref untuk auto-scroll
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const closeDropdown = () => setOpenDropdownId(null);
  const [itemsPerPage, setItemsPerPage] = useState(500);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1);

const [previousPage, setPreviousPage] = useState(1); 
  const [notifOn, setNotifOn] = useState(false);
  useEffect(() => {
    const userRef = databaseRef(database, `pengguna/${user1}/notifOn`);

    get(userRef).then((snap) => {
      if (snap.exists()) {
        setNotifOn(snap.val());
      }
    });
  }, [user1]);
  useEffect(() => {
    // const chatRef = databaseRef(database, "chatsBox");
    const chatRef = databaseRef(database, "chatsBox1");
    onValue(chatRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let messagesArray = Object.entries(data)
        .map(([id, msg]) => ({ id, ...msg })) // Menambahkan id ke objek pesan
        .filter((msg) =>
      // msg.status === "ACTIVE" && // Hanya ambil pesan yang aktif
      //   (
      //       (msg.pengirim === user1 && msg.penerima === user2) || 
      //       (msg.pengirim === user2 && msg.penerima === user1)
      //   ) &&
      //   (
      //       msg.onUSer === "ON" || // Kalau ON, tampil untuk semua
      //       (msg.onUSer === "OFF" && msg.pengirim === user1) || // Kalau OFF, tampil hanya untuk pengirim
      //       (msg.onUSer === "OFF" && msg.pengirim === user2)
      //   )
          msg.status === "ACTIVE" && 
        //    // msg.onUser !== "OFF" && 
        //   (msg.onUSer !== "OFF" || msg.pengirim === user1 || msg.pengirim === user2) && // Tetap tampilkan ke pengirim
         
          (
        //     (msg.pengirim === user1 && msg.penerima === user2) ||
        //     (msg.pengirim === user2 && msg.penerima === user1))

        // )
            (msg.pengirim === user1 && (msg.penerima === user2 || msg.penerima === null)) ||
    (msg.pengirim === user2 && (msg.penerima === user1 || msg.penerima === null))
  )
        .sort((a, b) => a.timestamp - b.timestamp);
        
        // **Ambil metadata untuk setiap file dalam pesan**
        messagesArray = await Promise.all(
          messagesArray.map(async (msg) => {
            if (msg.files && Array.isArray(msg.files)) {
              const filesWithMetadata = await Promise.all(
                msg.files.map(async (file) => {
                  try {
                    const fileRef = storageRef(storage, file.url);
                    const metadata = await getMetadata(fileRef);
                    return {
                      ...file,
                      size: metadata.size, // Ukuran dalam bytes
                      type: metadata.contentType, // Tipe file
                    };
                  } catch (error) {
                    console.error("Error getting metadata:", error);
                    return { ...file, size: null, type: null }; // Handle jika metadata gagal diambil
                  }
                })
              );
              return { ...msg, files: filesWithMetadata };
            }
            return msg;
          })
        );

        setMessages(messagesArray);

        // console.log(messagesArray);
        // **✅ Set halaman terakhir saat pertama kali load**
        const calculatedTotalPages = Math.ceil(messagesArray.length / itemsPerPage);
        // setTotalPages(calculatedTotalPages);
        setCurrentPage(calculatedTotalPages); // Auto-set ke halaman terakhir 
         if (notifOn && messagesArray.length > 0) {
          const lastMessage = messagesArray[messagesArray.length - 1];

          if (!lastMessage.read && lastMessage.penerima === user1) {
            new Notification(`Pesan Baru dari ${lastMessage.pengirim}`, {
              body: lastMessage.message,
              // icon: "/logo.png",
            });
          }
        }
      }
    });

  }, [user1, user2, notifOn ]);

  // **🔹 Update status "read" jika user adalah penerima**
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.penerima === user1 && !msg.read && msg.id) {
        update(databaseRef(database, `chatsBox1/${msg.id}`), {
          read: true,
          timestampRead: Date.now(),
        });
      }
    });
  }, [messages, user1]);

  // const paginatedMessages = messages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
 // Fungsi untuk menangani pencarian
 const handleSearch = (e) => {
  setSearchTerm(e.target.value);
  // setCurrentPage(1);
  if (e.target.value) {
    setPreviousPage(currentPage); // Simpan halaman sebelum pencarian
    setCurrentPage(1); // Reset ke halaman pertama agar hasil pencarian muncul langsung
  } else {
    window.location.reload();
  }
};

// Filter users berdasarkan input pencarian
const filteredUsers = searchTerm
? messages.filter(user => 
  user.pesan.toLowerCase().includes(searchTerm.toLowerCase())  
): messages;
// Jika hasil pencarian kosong, tampilkan notifikasi & kembalikan halaman sebelumnya
useEffect(() => {
  if (searchTerm && filteredUsers.length === 0) {
    alert("🚫 Data tidak ditemukan!");
    window.location.reload();
    
  }
}, [filteredUsers]);

const handleItemsPerPageChange = (e) => {
  setItemsPerPage(parseInt(e.target.value));
  setCurrentPage(1); // Reset to the first page on items per page change
};

const totalItemss = filteredUsers.length;
const indexOfLastUser = currentPage * itemsPerPage;
const indexOfFirstUser = indexOfLastUser - itemsPerPage;
const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

const totalPages = Math.ceil(totalItemss / itemsPerPage);
  // Auto-scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cek jika user scroll ke atas, maka tombol muncul
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    
    // Jika user scroll ke atas (lebih dari 100px dari paling bawah), tampilkan tombol
    setShowScrollButton(scrollTop < -100 || scrollTop < scrollHeight - clientHeight - 100);
  };

  // Scroll ke bawah saat tombol ditekan
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
const getPagination = () => {
    let pages = [];
    
    if (totalPages <= 2) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
        if (currentPage <= 2) {
            pages = [1, 2, '...', totalPages];
        } else if (currentPage >= totalPages - 1) {
            pages = [1, '...', totalPages - 1, totalPages];
        } else {
            pages = [1, '...', currentPage, '...', totalPages];
        }
    }
    return pages;
};

  const getPaginationa = () => {
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
    <>
    
      <div onClick={closeDropdown}
        className=" relative p-4 space-y-3 min-h-[400px] max-h-full rounded-lg overflow-auto"
        ref={chatContainerRef}
        onScroll={handleScroll}
        >
          
          <div className="flex justify-between  px-4 py-3">
           <div className="flex">
              <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="border rounded px-2 py-1"
              >
                  {/* <option value={10}>10</option> */}
                  // <option value={50}>50</option>
                  // <option value={100}>100</option>
                  // <option value={150}>150</option>
                  <option value={500}>500</option>
                  <option value={1300}>1300</option>
                  <option value={1300}>2300</option>
              </select>
              <div className="mt-4 text-sm text-gray-500">
                  Total Pesan: {filteredUsers.length}
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
          {totalPages  > 1 && (
            <nav className="m-4 flex items-center justify-between pt-4" aria-label="Table navigation">
              <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
             
              <ul className="inline-flex items-center -space-x-px">
                <li>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="py-2 px-4 border border-gray-300 rounded-l-lg"
                    disabled={currentPage === 1}
                  >
                    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 19-7-7 7-7"/>
                    </svg>

                  </button>
                </li>
                {/* {[...Array(totalPages)].map((_, i) => (
                  <li key={i + 1}>
                    <button
                      onClick={() => setCurrentPage(i + 1)}
                      className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1 ? 'bg-gray-300' : ''}`}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))} */}
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
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="py-2 px-4 border border-gray-300 rounded-r-lg"
                    disabled={currentPage === totalPages}
                  >
                    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7"/>
                    </svg>

                  </button>
                </li>
              </ul>
            </nav>
          )}
        {currentUsers.map((msg, index) => (
          <>
          {index === 0 ||  format(new Date(msg.timestamp), "dd-MM-yyyy") !== format(new Date(currentUsers[index - 1]?.timestamp || 0), "dd-MM-yyyy") ? (
 
            <div className="flex items-center my-4">
              <hr className="flex-grow border-t border-gray-300" />
              <span className="mx-4 text-gray-500 text-xs font-semibold">
                {format(new Date(msg.timestamp), "dd MMMM yyyy", { locale: id })}
              </span>
              <hr className="flex-grow border-t border-gray-300" />
            </div>
          ) : null}

          <ChatMessage key={index} message={msg} user1={user1}  setReplyMessage={setReplyMessage} setSearchTerm={setSearchTerm} setCurrentPage={setCurrentPage} openDropdownId={openDropdownId}
          setOpenDropdownId={setOpenDropdownId}/>
            </>
        ))}
        <div ref={messagesEndRef} />
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-32 right-6 bg-blue-700 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition"
          > <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg>


          </button>
        )}
        
      </div>
      </>
  );
};

export default ChatList;

            // <img src="/assets/Icon/down.svg" alt="Panah Bawah" className="h-6 w-6" />
            
