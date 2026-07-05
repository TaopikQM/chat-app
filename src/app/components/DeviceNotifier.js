'use client';
import { useEffect } from 'react';
import { ref, set, update } from 'firebase/database';
// import { databaseRef } from '@/lib/firebase'; // Sesuaikan path

import { database, storage, storageBackup, storageBackup1 } from "../config/firebase";
import { ref as databaseRef, push, update,set ,onValue} from "firebase/database";
// import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// import { uploadBytesResumable } from "firebase/storage";

// import { supabase } from  "../config/supabase";

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function DeviceNotifier({ userId }) {
  useEffect(() => {
    const registerDevice = async () => {
      // Cek dukungan browser
      if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

      // Minta izin
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log("Izin notifikasi ditolak atau belum diberikan.");
        return;
      }

      // Daftarkan Service Worker (Pastikan file /public/sw.js ada)
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          console.error("VAPID Public Key tidak ditemukan di .env.local");
          return;
        }

        // Buat Subscription
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });

        // Buat atau Ambil Unique Device ID
        let deviceId = localStorage.getItem('my_unique_device_id');
        if (!deviceId) {
          deviceId = `dev_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
          localStorage.setItem('my_unique_device_id', deviceId);
          console.log(`🆕 Device ID Baru Dibuat: ${deviceId}`);
        } else {
          console.log(`🔁 Device ID Ditemukan: ${deviceId}`);
        }

        // Data Device untuk disimpan
        const deviceData = {
          token: subscription,
          created_at: Date.now(),
          last_active: Date.now(),
          browser: navigator.userAgent,
          platform: navigator.platform,
          is_active: true
        };

        // Simpan ke Firebase: notifdevice/{userId}/tokens/{deviceId}
        const dbPath = `notifdevice/${userId}/tokens/${deviceId}`;
        await set(databaseRef(database, dbPath), deviceData);
        
        console.log(`✅ Device ${deviceId} tersimpan di Firebase untuk user ${userId}`);

      } catch (error) {
        console.error("❌ Gagal mendaftarkan device:", error);
      }
    };

    registerDevice();
  }, [userId]);

  return null; // Komponen ini tidak merender UI
}
