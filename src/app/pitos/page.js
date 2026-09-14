'use client';

import { useEffect, useState } from 'react';
import { getDatabase, ref, get, update } from 'firebase/database';
// ⚠️ PASTIKAN IMPORT SESUAI PATH KAMU
import { requestPermissionAndGetToken } from '../config/firebase'; 
import { db } from '../config/firebase'; // Import db dari config

export default function SitopPage() {
  const [status, setStatus] = useState('Memuat...');
  const [currentTokens, setCurrentTokens] = useState([]);

  useEffect(() => {
    // 1. Langsung proses, TANPA CEK LOGIN
    const saveTokenToSitop = async () => {
      try {
        // A. Minta Izin & Ambil Token
        setStatus('⏳ Meminta izin notifikasi...');
        const newToken = await requestPermissionAndGetToken();

        if (!newToken) {
          setStatus('❌ Gagal ambil token. (Cek Console)');
          return;
        }

        console.log('✅ Token didapat:', newToken);
        setStatus('✅ Token didapat. Menyimpan ke DB...');

        // B. SIMPAN KE "users/sitop" (HARDCODE)
        const userId = 'sitop'; // <-- INI KEY-nya
        const userRef = ref(db, `users/${userId}`);
        
        const snapshot = await get(userRef);
        const userData = snapshot.val() || {};
        
        let tokensList = userData.fcm_tokens || [];

        // C. Cek Duplikat
        if (tokensList.includes(newToken)) {
          setStatus('ℹ️ Token device ini SUDAH tersimpan.');
          setCurrentTokens(tokensList);
          return;
        }

        // D. Tambah Token Baru
        tokensList.push(newToken);
        
        // Batasi 5 device terakhir
        if (tokensList.length > 5) {
           tokensList.shift(); 
        }

        // E. Update Database
        await update(userRef, {
          fcm_tokens: tokensList,
          lastSeen: Date.now(),
          isOnline: true
        });

        setCurrentTokens(tokensList);
        setStatus(`✅ SUKSES! Token tersimpan di 'users/sitop'. Total: ${tokensList.length}`);
        console.log('✅ Daftar Token:', tokensList);

      } catch (error) {
        console.error('❌ Error:', error);
        setStatus('❌ Error: ' + error.message);
      }
    };

    saveTokenToSitop();
  }, []);

  return (
    <div className="p-8 font-mono bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Sitop Token Manager (No Auth)</h1>
      
      <div className="bg-white p-4 rounded shadow mb-4">
        <p className="font-bold">Status:</p>
        <p className={`mt-1 ${status.includes('SUKSES') ? 'text-green-600' : status.includes('❌') ? 'text-red-600' : 'text-yellow-600'}`}>
          {status}
        </p>
      </div>

      {currentTokens.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <p className="font-bold mb-2">Daftar Device (Tokens) di 'users/sitop':</p>
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
