"use client"; // Untuk menggunakan useState dan useEffect di Next.js App Router

import { useEffect, useState } from "react";

export default function PrayerTimesTable() {
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [today, setToday] = useState("");

  useEffect(() => {
    // Ambil data jadwal sholat dari API
    fetch("https://api.aladhan.com/v1/calendar/2025/1?latitude=-6.9667&longitude=110.4167&method=20&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&timezonestring=UTC&calendarMethod=UAQ")
      .then(response => response.json())
      .then(data => {
        if (data && data.data) {
          setPrayerTimes(data.data);
        }
      })
      .catch(error => console.error("Error fetching data:", error));
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Jam Digital */}
      <div className="text-center text-2xl font-bold text-gray-700 mb-4">
        {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </div>

      {/* Judul */}
      <h2 className="text-center text-3xl font-semibold text-blue-600">Jadwal Sholat Bulanan</h2>
      <p className="text-center text-gray-500 mt-2">{today}</p>

      {/* Tabel */}
      <div className="mt-6 overflow-x-auto">
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
            </tr>
          </thead>
          <tbody>
            {prayerTimes.map((day, index) => (
              <tr key={index} className="text-center">
                <td className="border border-gray-300 p-2">{day.date.gregorian.date}</td>
                <td className="border border-gray-300 p-2">{day.timings.Imsak}</td>
                <td className="border border-gray-300 p-2">{day.timings.Fajr}</td>
                <td className="border border-gray-300 p-2">{day.timings.Sunrise}</td>
                <td className="border border-gray-300 p-2">{day.timings.Dhuhr}</td>
                <td className="border border-gray-300 p-2">{day.timings.Asr}</td>
                <td className="border border-gray-300 p-2">{day.timings.Maghrib}</td>
                <td className="border border-gray-300 p-2">{day.timings.Isha}</td>
                <td className="border border-gray-300 p-2">{day.timings.Midnight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
