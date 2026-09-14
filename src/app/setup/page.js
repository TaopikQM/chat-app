'use client';

import { useEffect, useState } from 'react';
import { db, requestPermissionAndGetToken } from '../config/firebase';
import { ref, get, update } from 'firebase/database';

export default function SetupPage() {
  const [status, setStatus] = useState('Memuat...');
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const setup = async () => {
      try {
        setStatus('⏳ Meminta izin notifikasi...');
        
        // 1. Ambil Token
        const token = await requestPermissionAndGetToken();
        if (!token) {
          setStatus('❌ Gagal: Izin ditolak atau browser tidak support.');
          return;
        }

        setStatus('✅ Token didapat! Menyimpan ke database...');

        // 2. Simpan ke DB (Hardcode user: 'sitop')
        const userId = 'sitop';
        const userRef = ref(db, `users/${userId}`);
        
        const snapshot = await get(userRef);
        const data = snapshot.val() || {};
        
        let tokensList = data.fcm_tokens || [];

        // Cek duplikat
        if (!tokensList.includes(token)) {
          tokensList.push(token);
          await update(userRef, {
            fcm_tokens: tokensList,
            lastSeen: Date.now(),
            isOnline: true
          });
          setStatus(`✅ SUKSES! Total Device: ${tokensList.length}`);
        } else {
          setStatus('ℹ️ Token sudah tersimpan sebelumnya.');
        }

        setTokens(tokensList);

      } catch (error) {
        console.error('Error:', error);
        setStatus(`❌ Error: ${error.message}`);
      }
    };

    setup();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6">Setup Notifikasi</h1>
      
      <div className={`p-4 rounded-lg mb-6 ${
        status.includes('SUKSES') ? 'bg-green-100 border-green-500' : 
        status.includes('❌') ? 'bg-red-100 border-red-500' : 
        'bg-yellow-100 border-yellow-500'
      } border-l-4`}>
        <p className="font-bold text-lg">{status}</p>
      </div>

      {tokens.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="font-bold mb-3 text-gray-700">Device Terdaftar:</h2>
          <ul className="space-y-2">
            {tokens.map((t, i) => (
              <li key={i} className="text-xs bg-white p-3 rounded border break-all font-mono text-gray-600">
                {i + 1}. {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
