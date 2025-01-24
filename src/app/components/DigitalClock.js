"use client";

import { useEffect, useState } from "react";

export default function DigitalClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temperature: "-", condition: "-" });
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const alarmHours = [5, 6, 7, 8]; // Alarm pukul 5, 6, 7, dan 8 pagi
  const alarmDuration = 5 * 60 * 1000; // Alarm berbunyi selama 5 menit

  // Fungsi untuk mengambil cuaca dari API Open-Meteo
  const fetchWeather = async () => {
    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=-6.9667&longitude=110.4167&current_weather=true"
      );
      const data = await response.json();
      if (data && data.current_weather) {
        setWeather({
          temperature: `${data.current_weather.temperature}°C`,
          condition: "Cerah",
        });
      }
    } catch (error) {
      console.error("Gagal mengambil data cuaca:", error);
    }
  };

  // Update jam setiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ambil data cuaca setiap 10 menit
  useEffect(() => {
    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 600000);
    return () => clearInterval(weatherInterval);
  }, []);

  // Alarm otomatis setiap pukul 5, 6, 7, dan 8 pagi WIB
  useEffect(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    if (alarmHours.includes(hours) && minutes === 0) {
      triggerAlarm(hours, minutes);
    }
  }, [currentTime]);

  // Fungsi untuk memicu alarm
  const triggerAlarm = (hours, minutes) => {
    setIsAlarmActive(true);
    speakAlarm(hours, minutes);

    // Matikan alarm setelah 5 menit
    setTimeout(() => setIsAlarmActive(false), alarmDuration);
  };

  // Fungsi untuk mengucapkan waktu saat alarm berbunyi
  const speakAlarm = (hours, minutes) => {
    const text = `Sekarang pukul ${hours} lewat ${minutes} menit`;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "id-ID";
    speech.rate = 1;
    speechSynthesis.speak(speech);
  };

  // Fungsi untuk tombol Test Alarm
  const handleTestAlarm = () => {
    const now = new Date();
    triggerAlarm(now.getHours(), now.getMinutes());
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
      {/* Jam Digital */}
      <div className="text-6xl font-bold shadow-md p-4 bg-white bg-opacity-20 rounded-lg">
        {currentTime.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>

      {/* Cuaca & Suhu */}
      <div className="mt-4 text-xl text-center bg-white bg-opacity-20 p-4 rounded-lg shadow-md">
        <p className="font-semibold">Cuaca: {weather.condition}</p>
        <p className="font-semibold">Suhu: {weather.temperature}</p>
      </div>

      {/* Efek Alarm */}
      {isAlarmActive && (
        <div className="mt-4 p-4 bg-red-500 text-white font-bold text-lg rounded-lg animate-pulse shadow-lg">
          🔔 ALARM BERBUNYI! 🔔
        </div>
      )}

      {/* Tombol Test Alarm */}
      <button
        onClick={handleTestAlarm}
        className="mt-6 px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition"
      >
        🔊 Test Alarm
      </button>
    </div>
  );
}
