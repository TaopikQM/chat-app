"use client";

import { useEffect, useState } from "react";
import AdminChatTable from "../components/AdminChatTable";
import LAdminChatTable from "../components/LAdminChatTable";
import UsersChatTable from "../components/UsersChatTable";
import LUsersChatTable from "../components/LUsersChatTable";

export default function AdminPage() {
  const [open, setOpen] = useState([]); // null = semua tertutup

 // const toggle = (key) => {
   // setOpen(open === key ? null : key); // kalau klik yang sama, tutup
  //};
  const toggle = (key) => {
  if (open.includes(key)) {
    // kalau sudah ada → tutup (hapus dari array)
    setOpen(open.filter((item) => item !== key));
  } else {
    // kalau belum ada → buka (tambah ke array)
    setOpen([...open, key]);
  }
};
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // cek preferensi user sebelumnya
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 ">
     <div className="max-w-7xl mx-auto w-full flex flex-col h-screen border border-gray-900 dark:border-gray-100">
   
     {/*<div className="max-w-full mx-auto h-screen flex flex-col bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
       Header fixed top-0 left-0 w-full */}
      <div className="flex-none bg-white dark:bg-gray-900 border border-gray-900 dark:border-gray-100 shadow-md sticky top-0 z-50">
        <div className="relative flex items-center justify-center p-2">
         
            <button 
              onClick={toggleTheme} 
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-full text-sm px-2 py-2 m-2 dark:bg-gray-500 dark:text-gray-600 dark:border-gray-600 dark:hover:bg-gray-400 dark:hover:border-gray-400 dark:focus:ring-gray-500"
              aria-label="Toggle Theme" 
            >
              {isDark ? (
               // Icon Siang 🌞
                <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M13 3a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0V3ZM6.343 4.929A1 1 0 0 0 4.93 6.343l1.414 1.414a1 1 0 0 0 1.414-1.414L6.343 4.929Zm12.728 1.414a1 1 0 0 0-1.414-1.414l-1.414 1.414a1 1 0 0 0 1.414 1.414l1.414-1.414ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-9 4a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H3Zm16 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2ZM7.757 17.657a1 1 0 1 0-1.414-1.414l-1.414 1.414a1 1 0 1 0 1.414 1.414l1.414-1.414Zm9.9-1.414a1 1 0 0 0-1.414 1.414l1.414 1.414a1 1 0 0 0 1.414-1.414l-1.414-1.414ZM13 19a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2Z" clipRule="evenodd" />
                </svg>
              ) : (
                
                 // Icon Malam 🌙
                <svg className="w-6 h-6 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M11.675 2.015a.998.998 0 0 0-.403.011C6.09 2.4 2 6.722 2 12c0 5.523 4.477 10 10 10 4.356 0 8.058-2.784 9.43-6.667a1 1 0 0 0-1.02-1.33c-.08.006-.105.005-.127.005h-.001l-.028-.002A5.227 5.227 0 0 0 20 14a8 8 0 0 1-8-8c0-.952.121-1.752.404-2.558a.996.996 0 0 0 .096-.428V3a1 1 0 0 0-.825-.985Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Admin Chat */}
          <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
            <button
              onClick={() => toggle("Chat User")}
              className="w-full text-lg font-bold py-2 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Admin Chat Table
            </button>
            <div className={`${open.includes === "Chat User" ? "block" : "hidden"} mt-4`}>
              <AdminChatTable />
            </div>
          </div>

          {/* LAdmin Chat */}
          <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
            <button
              onClick={() => toggle("Sampah Chat")}
              className="w-full text-lg font-bold py-2 px-4 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
            >
              LAdmin Chat Table
            </button>
            <div className={`${open.includes === "Sampah Chat" ? "block" : "hidden"} mt-4`}>
              <LAdminChatTable />
            </div>
          </div>

          {/* Users Chat */}
          <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
            <button
              onClick={() => toggle("Users")}
              className="w-full text-lg font-bold py-2 px-4 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
            >
              Users Chat Table
            </button>
            <div className={`${open.includes === "Users" ? "block" : "hidden"} mt-4`}>
              <UsersChatTable />
            </div>
          </div>

          {/* LUsers Chat */}
          <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
            <button
              onClick={() => toggle("Log Users")}
              className="w-full text-lg font-bold py-2 px-4 rounded-xl bg-pink-600 text-white hover:bg-pink-700 transition"
            >
              LUsers Chat Table
            </button>
            <div className={`${open.includes === "Log Users" ? "block" : "hidden"} mt-4`}>
              <LUsersChatTable />
            </div>
          </div>
        </div>
      </div>
  </div>

  </div>
    
  );}
            {/* <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-10 space-y-6">
    
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-4">
        <button
          onClick={() => toggle("Chat User")}
          className="w-full text-lg font-bold py-2 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Admin Chat Table
        </button>
        {open === "Chat User" && (
          <div className="mt-4">
            <AdminChatTable />
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-4">
        <button
          onClick={() => toggle("Sampah Chat")}
          className="w-full text-lg font-bold py-2 px-4 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
        >
          LAdmin Chat Table
        </button>
        {open === "Sampah Chat" && (
          <div className="mt-4">
            <LAdminChatTable />
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-4">
        <button
          onClick={() => toggle("Users")}
          className="w-full text-lg font-bold py-2 px-4 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          Users Chat Table
        </button>
        {open === "Users" && (
          <div className="mt-4">
            <UsersChatTable />
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-4">
        <button
          onClick={() => toggle("Log Users")}
          className="w-full text-lg font-bold py-2 px-4 rounded-xl bg-pink-600 text-white hover:bg-pink-700 transition"
        >
          LUsers Chat Table
        </button>
        {open === "Log Users" && (
          <div className="mt-4">
            <LUsersChatTable />
          </div>
        )}
      </div>
    </div>
        return (
    <>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <AdminChatTable />
    </div>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <LAdminChatTable />
    </div>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <UsersChatTable />
    </div>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <LUsersChatTable />
    </div>
    </>
  );
}*/}
