"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Fungsi untuk mendapatkan tanggal hari ini dalam format DD-MM-YYYY di zona waktu Jakarta
  const getFormattedDate = () => {
    const jakartaOffset = 7 * 60; // Offset untuk Jakarta dalam menit (UTC+7)
    const now = new Date();
    now.setMinutes(now.getMinutes() + jakartaOffset); // Menyesuaikan dengan zona waktu Jakarta

    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    const weekday = now.toLocaleDateString('id-ID', { weekday: 'long' });

    return { date: `${day}-${month}-${year}`, day: weekday };
  };

  // Format waktu sesuai dengan zona waktu Jakarta, termasuk detik
  const formatTimeWithSeconds = (time) => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours + 7); // Menambahkan 7 jam untuk waktu WIB
    date.setMinutes(minutes);
    date.setSeconds(seconds);

    return date.toLocaleTimeString([], { hour12: false });
  };

  const fetchPrayerTimes = async () => {
    const dateToday = getFormattedDate().date; // Dapatkan tanggal hari ini
    const url = `https://api.aladhan.com/v1/timings/${dateToday}?latitude=-6.9667&longitude=110.4167&method=20&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&timezonestring=UTC&calendarMethod=UAQ`;

    try {
      const response = await axios.get(url);
      setPrayerTimes(response.data.data.timings);
    } catch (error) {
      console.error("Error fetching prayer times", error);
    }
  };

  // Update waktu setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Memanggil API waktu sholat saat komponen pertama kali dipasang
  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  return (
    <div className="p-4 space-y-6">
      {prayerTimes ? (
        <div className="space-y-4">
          {/* Kotak Digital dan Tanggal */}
          <div className="flex justify-between items-center rounded-lg p-4 bg-gray-800 text-white">
            <div className="text-3xl font-semibold">
              {currentTime.toLocaleTimeString("en-GB", { hour12: false })}
            </div>
            <div>
              <p className="text-sm">{getFormattedDate().date}</p>
              <p className="text-lg">{getFormattedDate().day}</p>
            </div>
          </div>

          {/* Kotak Waktu Sholat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.keys(prayerTimes).map((prayer) => (
              <div key={prayer} className="flex flex-col items-center bg-blue-600 text-white rounded-lg p-4 shadow-md">
                <div className="text-lg font-semibold">{prayer}</div>
                <div className="text-xl">{formatTimeWithSeconds(prayerTimes[prayer])}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Loading prayer times...</p>
      )}
    </div>
  );
};

export default PrayerTimes;
