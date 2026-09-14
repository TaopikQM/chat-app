'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';
// ⚠️ PASTIKAN IMPORT SESUAI PATH KAMU
import { requestPermissionAndGetToken, db } from '@/app/config/firebase'; 

export default function SitopPage() {
  const [status, setStatus] = useState('Memuat...');
  const [currentTokens, setCurrentTokens] = useState([]);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus('❌ Silakan login dulu.');
        return;
      }

      // ⚠️ PENTING: 
      // Jika kamu ingin simpan ke "users/sitop", pastikan user.uid == "sitop"
      // ATAU ambil username dari profil user.
      // Di sini saya asumsikan kamu ingin menyimpan ke ID user yang login.
      const userId = user.uid; 
      
      // Jika kamu memaksa pakai nama "sitop" sebagai key (tidak disarankan tapi sesuai request):
      // const userId = 'sitop'; 

      console.log('🚀 Proses Token untuk User:', userId);
      setStatus(`⏳ Memproses token untuk ${userId}...`);

      try {
        // 1. Minta Izin & Ambil Token Baru
        const newToken = await requestPermissionAndGetToken();

        if (!newToken) {
          setStatus('❌ Gagal ambil token (Izin ditolak/Error).');
          return;
        }

        // 2. Baca Data Lama dari Database (users/{userId})
        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val() || {};
        
        // Ambil list token lama, jika belum ada buat array kosong
        let tokensList = userData.fcm_tokens || [];

        // 3. Cek Duplikat (PENTING!)
        // Jika token ini sudah ada di list, jangan tambah lagi.
        // Ini mencegah 1 device nyimpen token yang sama berkali-kali.
        if (tokensList.includes(newToken)) {
          setStatus('ℹ️ Token device ini SUDAH tersimpan.');
          setCurrentTokens(tokensList);
          return;
        }

        // 4. Tambah Token Baru ke Array
        tokensList.push(newToken);
        
        // Opsional: Batasi jumlah token (misal max 5 device terakhir)
        // Jika lebih dari 5, hapus yang paling lama
        if (tokensList.length > 5) {
           tokensList.shift(); // Hapus index pertama (paling lama)
        }

        // 5. Simpan Kembali ke Database
        await update(userRef, {
          fcm_tokens: tokensList,
          lastSeen: Date.now(), // Update waktu akses terakhir
          isOnline: true
        });

        setCurrentTokens(tokensList);
        setStatus(`✅ SUKSES! Token tersimpan. Total Device: ${tokensList.length}`);
        console.log('✅ Daftar Token Saat Ini:', tokensList);

      } catch (error) {
        console.error('❌ Error:', error);
        setStatus('❌ Error: ' + error.message);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-8 font-mono bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Sitop Device Manager</h1>
      
      <div className="bg-white p-4 rounded shadow mb-4">
        <p className="font-bold">Status:</p>
        <p className={`mt-1 ${status.includes('SUKSES') ? 'text-green-600' : status.includes('❌') ? 'text-red-600' : 'text-yellow-600'}`}>
          {status}
        </p>
      </div>

      {currentTokens.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <p className="font-bold mb-2">Daftar Device (Tokens) di Akun Ini:</p>
          <div className="space-y-2">
            {currentTokens.map((token, index) => (
              <div key={index} className="text-xs bg-gray-100 p-2 rounded border-l-4 border-blue-500">
                <span className="font-bold text-gray-500">Device {index + 1}:</span>
                <br/>
                <span className="break-all text-gray-700">{token}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
