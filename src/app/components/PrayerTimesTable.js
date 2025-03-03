"use client"; // Untuk menggunakan useState dan useEffect di Next.js App Router

import { useEffect, useState } from "react";

export default function PrayerTimesTable() {
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [today, setToday] = useState('');
  
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState(null);
  const [calendarType, setCalendarType] = useState("masehi"); // Pilihan kalender


  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch(
  //         "https://api.aladhan.com/v1/calendar/2025/1?latitude=-6.9667&longitude=110.4167&method=20&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&timezonestring=UTC&calendarMethod=UAQ"
  //       );
  //       const data = await response.json();
  //       if (data && data.data) {
  //         setPrayerTimes(data.data);
  //         setLoading(false);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

   

  useEffect(() => {
    const fetchData = async (latitude, longitude) => {
      try {
        const currentYear = new Date().getFullYear();
        const apiUrl =
          calendarType === "hijriah"
            ? `https://api.aladhan.com/v1/hijriCalendar/${year}?latitude=${latitude}&longitude=${longitude}&method=20&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&timezonestring=UTC&calendarMethod=UAQ`
            : `https://api.aladhan.com/v1/calendar/${year}/1?latitude=${latitude}&longitude=${longitude}&method=20&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&timezonestring=UTC&calendarMethod=UAQ`;

        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data && data.data) {
          setPrayerTimes(data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal mengambil data.");
      } finally {
        setLoading(false);
      }
    };
    const getHijriYear = async () => {
      try {
        const response = await fetch(`https://api.aladhan.com/v1/gToH?date=${new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}`);
        const data = await response.json();
        return data?.data?.hijri?.year || null;
      } catch (err) {
        console.error("Error fetching Hijri year:", err);
        return null;
      }
    };

    // Mendapatkan lokasi dari Geolocation API
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchData(latitude, longitude);
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Gagal mendapatkan lokasi.");
          setLoading(false);
        }
      );
    } else {
      console.error("Geolocation tidak didukung di browser ini.");
      setError("Geolocation tidak didukung.");
      setLoading(false);
    }
  }, []);

    
  

  useEffect(() => {
    // Update waktu setiap detik
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Format tanggal hari ini
    const date = new Date();
    const options = { day: "numeric", month: "long", year: "numeric" };
    setToday(date.toLocaleDateString("id-ID", options));
  }, []);

   // Fungsi untuk konversi waktu UTC ke WIB
  const convertToWIB = (timeString) => {
    if (!timeString) return "-";
    const [hours, minutes] = timeString.split(" ")[0].split(":").map(Number);
    let newHours = (hours + 7) % 24;
    return `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  // Fungsi untuk mengecek apakah tanggal dari API adalah hari ini
  const isToday = (dateString) => {
    const today = new Date();
    const [day, month, year] = dateString.split("-").map(Number);
    return today.getDate() === day && today.getMonth() + 1 === month && today.getFullYear() === year;
  };

  return (
    <div className="">
      {/* Jam Digital */}
      <div className="text-center text-2xl font-bold text-gray-700 mb-4">
        {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </div>

<div className="flex justify-center mb-4">
        <select
          className="p-2 border rounded"
          value={calendarType}
          onChange={(e) => setCalendarType(e.target.value)}
        >
          <option value="masehi">Masehi</option>
          <option value="hijriah">Hijriah</option>
        </select>
      </div>

     {/* Kotak-kotak jam sholat */}
     {!loading && prayerTimes.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex justify-center gap-4 mb-6 min-w-max">
            {Object.entries(prayerTimes[0].timings)
              .filter(([key]) => ["Imsak", "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha", "Midnight"].includes(key))
              .map(([key, time], index) => (
                <div key={index} className="bg-blue-500 text-white p-3 rounded-lg text-center shadow-md min-w-[100px]">
                  <p className="text-sm font-semibold">{key}</p>
                  <p className="text-lg font-bold">{convertToWIB(time.split(" ")[0])}</p>
                </div>
              ))}
          </div>
        </div>
      )}


      {/* Judul */}
      <h2 className="text-center text-3xl font-semibold text-blue-600">Jadwal Sholat Bulanan</h2>
      <p className="text-center text-gray-500 mt-2">{today}</p>

      {/* Tabel */}
      <div className="mt-6 overflow-x-auto">
        <div className="min-w-max">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="border border-gray-300 p-2">Tanggal</th>
              <th className="border border-gray-300 p-2">Imsak</th>
              <th className="border border-gray-300 p-2">Fajar</th>
              <th className="border border-gray-300 p-2">Terbit</th>
              <th className="border border-gray-300 p-2">Dzuhur</th>
              <th className="border border-gray-300 p-2">Asar</th>
              <th className="border border-gray-300 p-2">Maghrib</th>
              <th className="border border-gray-300 p-2">Isya</th>
              <th className="border border-gray-300 p-2">Tengah Malam</th>
              <th className="border border-gray-300 p-2">Sepertiga Malam</th>
            </tr>
          </thead>
          <tbody>
            {prayerTimes.map((day, index) => {
              const isTodayRow = isToday(day.date.gregorian.date);
              return (
              <tr key={index} className={`text-center ${isTodayRow ? "bg-yellow-200 font-bold" : ""}`}>
                  <td className="border border-gray-300 p-2">
                    {day.date.gregorian.date} 
                    {isTodayRow}
                  </td>
                <td className="border border-gray-300 p-2">{convertToWIB(day.timings.Imsak)}</td>
                <td className="border border-gray-300 p-2">{convertToWIB(day.timings.Fajr)}</td>
                <td className="border border-gray-300 p-2">{convertToWIB(day.timings.Sunrise)}</td>
                <td className="border border-gray-300 p-2">{convertToWIB(day.timings.Dhuhr)}</td>
                <td className="border border-gray-300 p-2">{convertToWIB(day.timings.Asr)}</td>
                <td className="border border-gray-300 p-2">{convertToWIB(day.timings.Maghrib)}</td>
                <td className="border border-gray-300 p-2">{convertToWIB(day.timings.Isha)}</td>
                <td className="border border-gray-300 p-2">{convertToWIB(day.timings.Midnight)}</td>
                <td className="border border-gray-300 p-2">{convertToWIB(day.timings.Lastthird)}</td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}


//<span className="ml-2 text-red-600 font-semibold">Hari Ini</span>
