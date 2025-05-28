

"use client"; 
import { useEffect, useState, useRef } from "react";

export default function LUsersChatTable() {
  const [prayerTimes, setPrayerTimes] = useState([]);
  // const [currentTime, setCurrentTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeZone, setTimeZone] = useState("Asia/Jakarta"); // Default WIB
  const [zoneText, setZoneText] = useState("WIB");
  const [todayPrayerTimes, setTodayPrayerTimes] = useState(null); // Data hari ini
  const [tomorrowPrayerdTimes, setTomorrowPrayerTimes] = useState(null); // Data hari ini
  const [todayPrayerd, setTodayPrayerd] = useState(null); // Data hari ini
  const [tomorrowPrayerd, setTomorrowPrayerd] = useState(null); // Data hari ini
  // const [five, setFive] = useState(null); // Data hari ini
  const [Five, setFive] = useState(null); // Data hari ini
  const [Five2, setFive2] = useState(null); // Data hari ini
  const [isFetched, setIsFetched] = useState(false); // Supaya fetch cuma sekali
  const [prevMonthData, setPrevMonthData] = useState(null); // Simpan data sebelumnya
  const [isClient, setIsClient] = useState(false); // Tambahkan flag
  const [prevLocation, setPrevLocation] = useState(null);
  const [today, setToday] = useState("");
  const [location, setLocation] = useState("Mendeteksi lokasi...");
  const [countdown, setCountdown] = useState(null);
  const [negativeCountdown, setNegativeCountdown] = useState(null);
  const [triggerHour, setTriggerHour] = useState("");
  const [triggerMinute, setTriggerMinute] = useState("");
  const [triggers, setTriggers] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const countdownRef = useRef(null);
  const negativeCountdownRef = useRef(null);
  const sholawatAudioRef = useRef(null);
  const adzanAudioRef = useRef(null);
  const adzanFajrRef = useRef(null);

  const [showDropdown, setShowDropdown] = useState(false);

  // const SholawatD = "./audio/S_gusdur.mp3";
  // const adzanSound = "./audio/a1.mp3";
  // const adzanFajrSound = "./audio/A_SubuhA.mp3";

  const SholawatD = "https://firebasestorage.googleapis.com/v0/b/env-sib.appspot.com/o/chatFiles%2FS_gusdur.mp3?alt=media&token=18049f6c-c778-4382-904c-880d4a6cf0c2";
  const adzanSound = "https://firebasestorage.googleapis.com/v0/b/env-sib.appspot.com/o/chatFiles%2Fa1.mp3?alt=media&token=9651bfb8-a2c7-4a49-befc-de1b4ce90048";
  // const adzanFajrSound = "https://firebasestorage.googleapis.com/v0/b/env-sib.appspot.com/o/chatFiles%2FA_SubuhA.mp3?alt=media&token=7e3987f1-6c6d-4822-b448-c275e8187847";
  const adzanFajrSound = "https://firebasestorage.googleapis.com/v0/b/env-sib.appspot.com/o/chatFiles%2FAdzan%20Subuh%20Merdu.mp3?alt=media&token=ed4bd73e-7f2c-45a0-8dfb-5e301676bc98";

  useEffect(() => {
    setIsClient(true); // Pastikan hanya berjalan di client

    if (todayPrayerTimes?.meta?.timezone) {
      const tz = todayPrayerTimes.meta.timezone;
      setTimeZone(tz);

      // Mapping zona waktu ke WIB, WITA, atau WIT
      if (tz === "Asia/Jakarta") setZoneText("WIB");
      else if (tz === "Asia/Makassar") setZoneText("WITA");
      else if (tz === "Asia/Jayapura") setZoneText("WIT");
      else setZoneText(""); // Jika zona tidak dikenali, kosongkan
    }

    // Update waktu setiap detik
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [todayPrayerTimes]);

  useEffect(() => {
    if (!currentTime) return;
    const fetchHijriYear = async () => {
      try {
        const day = currentTime.getDate();
        const month = currentTime.getMonth() + 1;
        const year = currentTime.getFullYear();

        const response = await fetch(
          `https://api.aladhan.com/v1/gToH?date=${day}-${month}-${year}`
        );
        const data = await response.json();
        const hijriYear = data.data.hijri.year;
        const hijriMonth = data.data.hijri.month.number;

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              // await fetchLocation(latitude, longitude);
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  const { latitude, longitude } = position.coords;
              
                 
                 // try {
                 //    const response = await fetch("/api/reverseGeocode", {
                 //      method: "POST", // Kirim pakai POST
                 //      headers: { "Content-Type": "application/json" },
                 //      body: JSON.stringify({ lat: latitude, lon: longitude })
                 //    });
              
                 //    if (!response.ok) throw new Error("Gagal mendapatkan lokasi");
              
                 //    const data = await response.json();
                 //    // ✅ Cek apakah data sudah pernah ditampilkan sebelumnya
                 //    if (!prevLocation || JSON.stringify(prevLocation) !== JSON.stringify(data)) {
                 //      console.log("Lokasi dari backend:", data);
                 //      setPrevLocation(data); // Simpan data yang sudah di-log
                 //    } else {
                 //      console.log("Data lokasi tidak berubah, tidak log ulang");
                 //    }

                 //    if (data && data.address) {
                 //      setLocation(`${data.address.city || data.address.town || "Tidak Diketahui"}, ${data.address.country}`);
                 //    }
                 //  } catch (error) {
                 //    console.error("Error:", error);
                 //  }
                },
                (error) => console.error("Gagal mendapatkan lokasi:", error),
                { enableHighAccuracy: true }
              );
              // fetchLocation(latitude, longitude);
              // const lokasi = await fetch(
              //   `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              // );
              // const dlok = await lokasi.json();
              // if (dlok && dlok.address) {
              //   setLocation(`${dlok.address.city || dlok.address.town || "Tidak Diketahui"}, ${dlok.address.country}`);
              // }
               // 🔹 Tambahkan request untuk mendapatkan nama lokasi
               
              const response = await fetch(
                `https://api.aladhan.com/v1/hijriCalendar/${hijriYear}?latitude=${latitude}&longitude=${longitude}&method=20&shafaq=general`
              );
              const tm = await response.json();
              const monthData = tm.data[hijriMonth];
              function getJavaneseDay(dateString) {
                // Konversi tanggal string ke Date object
                const [day, month, year] = dateString.split('-').map(Number);
                const date = new Date(year, month - 1, day);

                // Referensi hari Jawa: 1 Muharram 1446 H = 7 Juli 2024 = Ahad Legi
                const referenceDate = new Date(2024, 6, 7); // bulan 5 = Juni karena index 0

                const pancawara = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
                const daysDiff = Math.floor((date - referenceDate) / (1000 * 60 * 60 * 24));
                const index = (4+daysDiff % 5 + 5) % 5; // pastikan positif

                return pancawara[index];
              }
              const updatedMonthData = monthData.map(item => {
                const dateString = item.date.gregorian.date; // format "DD-MM-YYYY"
                const javaneseDay = getJavaneseDay(dateString);
                return {
                  ...item,
                  date: {
                    ...item.date,
                    javaneseDay
                  }
                };
              });

              console.log("bulan dengan hari jawa", updatedMonthData);
              

              if (!prevMonthData || prevMonthData.length !== monthData.length || 
                !prevMonthData.every((item, index) => item.date.gregorian.date === monthData[index].date.gregorian.date)) {

                setPrayerTimes(updatedMonthData);
                setPrevMonthData(updatedMonthData); // Simpan sebagai data sebelumnya

                // Ambil data hari ini dari monthData
                const ddate = `${day.toString().padStart(2, "0")}-${month.toString().padStart(2, "0")}-${year}`;
                const todayData = monthData.find((d) => d.date.gregorian.date === ddate);

                setTodayPrayerTimes(todayData || null);
                console.log("Today's Prayer Data:", todayData);

              
                // ✅ Langsung simpan hanya bagian timings
                const todayTimings = todayData ? todayData.timings : null;

                if (!todayPrayerTimes || JSON.stringify(todayPrayerTimes) !== JSON.stringify(todayTimings)) {
                  setTodayPrayerd(todayTimings);
                  console.log("Today's Prayer Timings:", todayTimings);
                }     
                const filteredTimings = Object.fromEntries(
                  Object.entries(todayTimings).filter(([key]) =>
                    ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(key)
                  )
                );
                setFive(filteredTimings);
                // console.log(filteredTimings);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1); // Tambah 1 hari

                // Format tanggal besok ke "DD-MM-YYYY"
                const tdate = `${tomorrow.getDate().toString().padStart(2, "0")}-${(tomorrow.getMonth() + 1).toString().padStart(2, "0")}-${tomorrow.getFullYear()}`;

                // Cari data untuk besok di monthData
                const tomorrowData = updatedMonthData.find((d) => d.date.gregorian.date === tdate);

                // Simpan ke state
                setTomorrowPrayerTimes(tomorrowData || null);

                // console.log("Tomorrow's Prayer Data:", tomorrowData);
                
                // ✅ Langsung simpan hanya bagian timings
                const tomorrowTimings = tomorrowData ? tomorrowData.timings : null;

                if (!tomorrowPrayerdTimes || JSON.stringify(tomorrowPrayerdTimes) !== JSON.stringify(tomorrowTimings)) {
                  setTomorrowPrayerd(tomorrowTimings);
                  // console.log("Tomorrow's Prayer Timings:", tomorrowTimings);
                }

                // Ambil hanya waktu Fajr, Dhuhr, Asr, Maghrib, dan Isha
                const filtomorrTimings = Object.fromEntries(
                  Object.entries(tomorrowTimings).filter(([key]) =>
                    ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(key)
                  )
                );
                setFive2(filtomorrTimings);
                // console.log("filter besok",filtomorrTimings);
                
              }
              

            },
            (err) => {
              console.error("Error getting location:", err);
            }
          );
        }
      } catch (err) {
        console.error("Error fetching Hijri year:", err);
      }
    };
    fetchHijriYear();
  }, [currentTime,prevMonthData]);
 // Debugging perubahan Five
  useEffect(() => {
    // console.log("Updated Five:", Five);
  }, [Five]);

  // Fungsi untuk mengurangi 12 menit dari waktu sholat
  const adjustTimings = (Five) => {
    if (!Five || Object.keys(Five).length === 0) return {}; // Pastikan return objek kosong jika undefined/null

    const adjusted = {};

    Object.entries(Five).forEach(([key, value]) => {
        let [hour, minute] = value.split(" ")[0].split(":").map(Number); // Ambil jam & menit
        minute -= 12; // Kurangi 12 menit

        if (minute < 0) {
            minute += 60;
            hour -= 1;
        }

        // Format hasilnya agar tetap HH:MM (dua digit)
        adjusted[key] = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} (WIB)`;
    });

    return adjusted;
  };

  // State untuk menyimpan waktu yang telah disesuaikan
  const [adjustedTimings, setAdjustedTimings] = useState({});

  // Update adjustedTimings setiap kali Five berubah
  useEffect(() => {
    if (Five) {
        const newTimings = adjustTimings(Five);
        setAdjustedTimings(newTimings);
        // console.log("Adjusted Timings:", newTimings);
    }
  }, [Five]); // Trigger update saat Five berubah

  useEffect(() => {
    // console.log("Updated Five:", Five2);
  }, [Five2]);

  // Fungsi untuk mengurangi 12 menit dari waktu sholat
  const adjustTomorrowTimings = (Five2) => {
    if (!Five2 || Object.keys(Five2).length === 0) return {}; // Pastikan return objek kosong jika undefined/null

    const adjusted = {};

    Object.entries(Five2).forEach(([key, value]) => {
        let [hour, minute] = value.split(" ")[0].split(":").map(Number); // Ambil jam & menit
        minute -= 12; // Kurangi 12 menit

        if (minute < 0) {
            minute += 60;
            hour -= 1;
        }

        // Format hasilnya agar tetap HH:MM (dua digit)
        adjusted[key] = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} (WIB)`;
    });

    return adjusted;
  };

  // State untuk menyimpan waktu yang telah disesuaikan
  const [adjustToTimings, setAdjustedToTimings] = useState({});

  // Update adjustedTimings setiap kali Five berubah
  useEffect(() => {
    if (Five2) {
        const newTimings = adjustTomorrowTimings(Five2);
        setAdjustedToTimings(newTimings);
        // console.log("Adjusted Timings:", newTimings);
    }
  }, [Five2]); // Trigger update saat Five berubah

  const fetchLocation = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      if (data && data.address) {
        setLocation(`${data.address.city || data.address.town || "Tidak Diketahui"}, ${data.address.country}`);
      }
    } catch (error) {
      console.error("Gagal mengambil lokasi:", error);
      setLocation("Lokasi tidak ditemukan");
    }
  };

  useEffect(() => {
    if (!adjustedTimings || Object.keys(adjustedTimings).length === 0) return;
  
    Object.entries(adjustedTimings).forEach(([key, value]) => {
      const [hour, minute] = value.split(" ")[0].split(":"); // Pisahkan jam dan menit
      const newHour = parseInt(hour);
      const newMinute = parseInt(minute);
      const now = new Date();
  
      // Tambahkan waktu ke triggers hanya jika lebih besar dari waktu saat ini dan tidak ada yang sama
      if (
        (newHour > now.getHours() || (newHour === now.getHours() && newMinute > now.getMinutes())) &&
        !triggers.some(t => t.hour === newHour && t.minute === newMinute) // Cek duplikat
      ) {
        setTriggers((prevTriggers) => [
          ...prevTriggers,
          { hour: newHour, minute: newMinute },
        ]);
      }
    });
  }, [adjustedTimings, triggers]); // 🔥 Tambahkan adjustedTimings ke dependensi
  useEffect(() => {
    if (!adjustToTimings || Object.keys(adjustToTimings).length === 0) return;
  
    Object.entries(adjustToTimings).forEach(([key, value]) => {
      const [hour, minute] = value.split(" ")[0].split(":"); // Pisahkan jam dan menit
      const newHour = parseInt(hour);
      const newMinute = parseInt(minute);
      const now = new Date();
  
      // Tambahkan waktu ke triggers hanya jika lebih besar dari waktu saat ini dan tidak ada yang sama
      if (
        (newHour > now.getHours() || (newHour === now.getHours() && newMinute > now.getMinutes())) &&
        !triggers.some(t => t.hour === newHour && t.minute === newMinute) // Cek duplikat
      ) {
        setTriggers((prevTriggers) => [
          ...prevTriggers,
          { hour: newHour, minute: newMinute },
        ]);
      }
    });
  }, [adjustToTimings, triggers]); // 🔥 Tambahkan adjustedTimings ke dependensi
  
  
  const convertToWIB = (timeString) => {
    if (!timeString) return "-";
    const [hours, minutes] = timeString.split(" ")[0].split(":").map(Number);
    let newHours = (hours) % 24;
    return String(newHours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
  };
  const isToday = (dateString) => {
    if (!currentTime) return false;
    const [day, month, year] = dateString.split("-").map(Number);
    return currentTime.getDate() === day && currentTime.getMonth() + 1 === month && currentTime.getFullYear() === year;
  };

  useEffect(() => {
    if (!currentTime) return;
    setToday(currentTime.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
  }, [currentTime]);

  const convertToDate = (timeString) => {
    const now = new Date();
    const [hours, minutes] = timeString.split(":").map(Number);
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  };

  const translateDayToIndo = (dayEn) => {
    const daysMap = {
      "Monday": "Senin",
      "Tuesday": "Selasa",
      "Wednesday": "Rabu",
      "Thursday": "Kamis",
      "Friday": "Jumat",
      "Saturday": "Sabtu",
      "Sunday": "Minggu",
    };
    return daysMap[dayEn] || dayEn; // Pakai aslinya kalau tidak ada di mapping
  };

  useEffect(() => {
    sholawatAudioRef.current = new Audio(SholawatD);
    adzanAudioRef.current = new Audio(adzanSound);
    adzanFajrRef.current = new Audio(adzanFajrSound); 
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      triggers.forEach(({ hour, minute }, index) => {
        if (hour === currentHour && minute === currentMinute && !isRunning) {
          startCountdown(prayerType);
          setTriggers([]); // Hapus tampilan list setelah waktu dipicu
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [triggers, isRunning]);

  let prayerType;
  const addTrigger = () => {
    if (triggerHour === "" || triggerMinute === "") return;
    const now = new Date();
    const newHour = parseInt(triggerHour);
    const newMinute = parseInt(triggerMinute);

    if (
      newHour < now.getHours() ||
      (newHour === now.getHours() && newMinute < now.getMinutes())
    ) {
      alert("Tidak bisa memilih waktu sebelum waktu saat ini.");
      return;
    }

    const prayerType = newHour  >= 1 && newHour < 6 ? "Fajr" : "Normal"; 

    setTriggers([...triggers, { hour: newHour, minute: newMinute }]);
    setTriggerHour("");
    setTriggerMinute("");
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const startCountdown = () => {
    if (isRunning) return;
    
    const now = new Date();
    const newHour = now.getHours();
    setIsRunning(true);
    setCountdown(12 * 60);
    countdownRef.current = 12 * 60;

    const sholawatAudio = sholawatAudioRef.current;
    // const adzanAudio = adzanAudioRef.current;
    const prayerType = newHour >= 1 && newHour < 6 ? "Fajr" : "Normal"; 

    const adzanAudio = prayerType === "Fajr" ? adzanFajrRef.current : adzanAudioRef.current; // Pilih audio yang sesuai


    sholawatAudio.pause();
    sholawatAudio.currentTime = 0;
    adzanAudio.pause();
    adzanAudio.currentTime = 0;
    sholawatAudio.play();

    const interval = setInterval(() => {
      countdownRef.current -= 1;
      setCountdown(countdownRef.current);

      if (countdownRef.current <= 0) {
        clearInterval(interval);
        setCountdown(null);
        startNegativeCountdown(sholawatAudio, adzanAudio);
      }
    }, 1000);

    sholawatAudio.onended = () => {
      setTimeout(() => {
        adzanAudio.play();
      }, 7500);
    };
  };

  const startNegativeCountdown = (sholawatAudio, adzanAudio) => {
    setNegativeCountdown(0);
    negativeCountdownRef.current = 0;

    const negInterval = setInterval(() => {
      if (!sholawatAudio.ended || !adzanAudio.ended) {
        negativeCountdownRef.current -= 1;
        setNegativeCountdown(negativeCountdownRef.current);
      } else {
        clearInterval(negInterval);
        
        setNegativeCountdown(null);
        setIsRunning(false);setIsRunning(false);
      }
    }, 1000);
  };
 
  const handleAddTimings = () => {
    // Mengambil waktu yang lebih besar dari waktu saat ini dan memisahkan jam dan menit
    Object.entries(adjustedTimings).forEach(([key, value]) => {
      const [hour, minute] = value.split(" ")[0].split(":");
      const newHour = parseInt(hour);
      const newMinute = parseInt(minute);

      // Cek jika waktunya lebih besar dari waktu saat ini dan belum ada
      if (
        newHour > currentTime.getHours() ||
        (newHour === currentTime.getHours() && newMinute > currentTime.getMinutes())
      ) {
        setTriggerHour(newHour);
        setTriggerMinute(newMinute);
        addTrigger(); // Menambahkan trigger otomatis
      }
    });
  };

  const removeTrigger = (index) => {
    setTriggers((prevTriggers) => prevTriggers.filter((_, i) => i !== index));
  };
  
  const prayerOrder = ["Imsak", "Fajr", "Sunrise", "Dhuhr", "Asr", "Sunset", "Maghrib", "Isha", "Lastthird"]; // Urutan yang benar

  // const timings = prayerTimes[0]?.timings || {};
  // Ambil data dari todayPrayerd dengan fallback ke objek kosong
  const timings = todayPrayerd ? prayerOrder.reduce((acc, prayer) => {
    if (todayPrayerd[prayer]) {
      acc[prayer] = todayPrayerd[prayer]; // Pastikan hanya mengambil yang ada di todayPrayerd
    }
    return acc;
  }, {}) : {};

  // console.log("timing1",timings);

  const timings2 = tomorrowPrayerd ? prayerOrder.reduce((acc, prayer) => {
    if (tomorrowPrayerd[prayer]) {
      acc[prayer] = tomorrowPrayerd[prayer]; // Pastikan hanya mengambil yang ada di todayPrayerd
    }
    return acc;
  }, {}) : {};
  // console.log("timing2",timings2);
  return (
    <div className="p-4">
      <div className="text-center text-5xl font-bold text-gray-700 mb-4">
        {/* {isClient?currentTime ? currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Memuat...": "Memuat..."} */}
       <br/>
         {isClient
        ? currentTime
          ? `${new Intl.DateTimeFormat("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZone: timeZone, // Gunakan zona waktu dari API
            }).format(currentTime)} (${zoneText})`
          : "Memuat..."
        : "Memuat..."}
        
        <div className="text-3xl">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-blue-500 text-white px-2 py-1 bg-opacity-20 p-3 rounded-lg"
          >
            {showDropdown ? "⬆" : "⬇"}
          </button>
          {showDropdown && (
            <div className="mb-4 flex flex-col justify-center gap-2">
              <div className="flex flex-wrap justify-center gap-2">
                <input
                  type="number"
                  placeholder="J.(0-23)"
                  value={triggerHour}
                  onChange={(e) => setTriggerHour(e.target.value)}
                  className="border p-1 w-40 text-center"
                  min={currentTime.getHours()}
                  max="40"
                  disabled={isRunning}
                />
                <input
                  type="number"
                  placeholder="M.(0-59)"
                  value={triggerMinute}
                  onChange={(e) => setTriggerMinute(e.target.value)}
                  className="border p-1 w-40 text-center"
                  min={triggerHour == currentTime.getHours() ? currentTime.getMinutes() : 0}
                  max="59"
                  disabled={isRunning}
                />
                <button
                  onClick={addTrigger}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  disabled={isRunning}
                >
                  Tambah
                </button>
              </div>
                {/* <div className="mb-4">
                  <button
                    onClick={handleAddTimings}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    Tambah Waktu Otomatis
                  </button>
                </div> */}
                {triggers.length > 0 && (
                  <ul className="border p-2 rounded-md mb-4">
                    {triggers.map((t, index) => (
                      <li key={index} className="flex justify-between p-1 border-b">
                        <span>{`${t.hour}:${String(t.minute).padStart(2, "0")}`}</span>
                        <button
                          onClick={() => removeTrigger(index)}  // Fungsi untuk menghapus item
                          className="text-red-500"
                        >
                          X
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <br/>
                <button onClick={startCountdown} className="bg-green-500 text-white px-4 py-2 rounded-md"
                disabled={isRunning}>Uji Coba</button>
            </div>
          )}
        </div>
        {isRunning && (
          <div className=" bg-white bg-opacity-20 p-3 rounded-lgtext-center">
          <p className="text-lg text-gray-800">
              {countdown !== null 
                ? formatTime(countdown) 
                : negativeCountdown !== null 
                  ? `-${formatTime(negativeCountdown)}` 
                  : "00:00"}
            </p>
          </div>
        )}
        <hr/>
        <div className="mt-3 text-lg text-center bg-white bg-opacity-20 p-3 rounded-lg">
          <p className="text-center text-gray-500 mt-2">
            {todayPrayerTimes?.date?.hijri?.day} {todayPrayerTimes?.date?.hijri?.month?.en} {todayPrayerTimes?.date?.hijri?.year} H
          </p>
          <p className="text-center text-gray-500 mt-2">
            ({translateDayToIndo(todayPrayerTimes?.date?.gregorian?.weekday?.en)} {todayPrayerTimes?.date?.javaneseDay || "-"})
              { }{todayPrayerTimes?.date?.gregorian?.day} {todayPrayerTimes?.date?.gregorian?.month?.en} {todayPrayerTimes?.date?.gregorian?.year}
          </p>
        </div>
        <div className="p-4 flex flex-wrap gap-2 justify-center bg-white bg-opacity-20 p-3 rounded-lg">
          {prayerOrder.map((prayer, index) => {
            const time = timings[prayer];
            if (!time) return null;

            const prayerTimeStr = time.split(" ")[0]; 
            const prayerDate = convertToDate(prayerTimeStr);
            const diffInMinutes = Math.floor((prayerDate - currentTime) / 60000);
            
            let bgColor = "bg-blue-500"; // Default Biru
            if (diffInMinutes > 0 && diffInMinutes <= 10) {
              bgColor = "bg-yellow-500"; // Kuning kalau countdown
            } else if (diffInMinutes < 0) {
              bgColor = "bg-red-500"; // Merah kalau sudah lewat
            }
            const isMainPrayer = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(prayer);
            const isNearestPrayer = isMainPrayer && diffInMinutes >= 0 && diffInMinutes <= 10;

            return (
              // <div key={index} className={`p-3 rounded-lg text-center shadow-md min-w-[100px] text-white ${bgColor}`}>
              //   <p className="text-sm font-semibold">{prayer === "Lastthird" ? "Sepertiga Malam" : prayer}</p>
              //   {/* <p className="text-lg font-bold">{prayerTime}</p> */}
              //   <p className="text-lg font-bold">{time}</p>

              //   {/* Tampilkan countdown hanya jika isRunning */}
              //   {isRunning && isNearestPrayer  && (
              //     <div className="mt-2 p-2 border rounded-lg shadow-md bg-white text-gray-800">
              //       {/* <p className="text-sm font-semibold">Countdown</p> */}
              //       <p className="text-lg font-bold">
              //         {countdown !== null 
              //           ? formatTime(countdown) 
              //           : negativeCountdown !== null 
              //             ? `-${formatTime(negativeCountdown)}` 
              //             : "00:00"}
              //       </p>
              //     </div>
              //   )}
              // </div>
              // <div key={index} className={`relative p-3 rounded-lg text-center shadow-md min-w-[100px] text-white ${bgColor}`}>
              //   <p className="text-sm font-semibold">{prayer === "Lastthird" ? "Sepertiga Malam" : prayer}</p>
              //   <p className="text-lg font-bold">{time}</p>

              //   {/* Countdown dibuat absolute agar tidak mengubah ukuran kotak */}
              //   {isRunning && isNearestPrayer && (
              //     <div className="absolute left-1/2 -translate-x-1/2 bottom-[-40px] p-2 border rounded-lg shadow-md bg-white text-gray-800 w-auto">
              //       <p className="text-lg font-bold">
              //         {countdown !== null 
              //           ? formatTime(countdown) 
              //           : negativeCountdown !== null 
              //             ? `-${formatTime(negativeCountdown)}` 
              //             : "00:00"}
              //       </p>
              //     </div>
              //   )}
              // </div>
              <div
                key={index}
                className={`relative text-center shadow-md p-3 rounded-lg text-white transition-all duration-300 
                  ${isNearestPrayer ? "py-6 h-[100px]" : "py-3 h-[70px]"}  
                  ${bgColor}`}
              >
                <p className="text-sm font-semibold">
                  {prayer === "Lastthird" ? "Sepertiga Malam" : prayer}
                </p>
                <p className="text-lg font-bold">{time}</p>

                {/* Countdown hanya untuk waktu sholat terdekat */}
                {isRunning && isNearestPrayer && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[-40px] p-2 border rounded-lg shadow-md bg-white text-gray-800 w-auto">
                    <p className="text-lg font-bold">
                      {countdown !== null
                        ? formatTime(countdown)
                        : negativeCountdown !== null
                        ? `-${formatTime(negativeCountdown)}`
                        : "00:00"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <hr/>
        <div className="mt-2 text-lg text-center bg-white bg-opacity-20 p-2 rounded-lg">
          <p className="text-center text-gray-500 mt-2">
            {tomorrowPrayerdTimes?.date?.hijri?.day} {tomorrowPrayerdTimes?.date?.hijri?.month?.en} {tomorrowPrayerdTimes?.date?.hijri?.year} H
          </p>
          <p className="text-center text-gray-500 mt-2">
            ({translateDayToIndo(tomorrowPrayerdTimes?.date?.gregorian?.weekday?.en)} {tomorrowPrayerdTimes?.date?.javaneseDay || "-"})
              { } {tomorrowPrayerdTimes?.date?.gregorian?.day} {tomorrowPrayerdTimes?.date?.gregorian?.month?.en} {tomorrowPrayerdTimes?.date?.gregorian?.year}
          </p>
        </div>
        <div className="p-4 flex flex-wrap gap-2 justify-center bg-white bg-opacity-20 p-3 rounded-lg">
          
          {prayerOrder.map((prayer, index) => {
            const time = timings2[prayer];
            if (!time) return null;
            const isTomorrow = tomorrowPrayerd?.[prayer] === time; // Cek apakah dari besok
            const prayerTimeStr = time.split(" ")[0];
            const [hour, minute] = prayerTimeStr.split(":").map(Number);

            const prayerDate = new Date();
            prayerDate.setHours(hour, minute, 0, 0);

            // Jika waktu dari besok, tambahkan 1 hari
            if (isTomorrow) {
              prayerDate.setDate(prayerDate.getDate() + 1);
            }
            const diffInMinutes = Math.floor((prayerDate - currentTime) / 60000);
            
            let bgColor = "bg-blue-500"; // Default Biru
            if (diffInMinutes > 0 && diffInMinutes <= 10) {
              bgColor = "bg-yellow-500"; // Kuning kalau countdown
            } else if (diffInMinutes < 0) {
              bgColor = "bg-red-500"; // Merah kalau sudah lewat
            }


            const isMainPrayer = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(prayer);


            // ✅ Cek apakah ini waktu sholat terdekat (yang sedang berjalan / akan segera)
            const isNearestPrayer = isMainPrayer && diffInMinutes >= 0 && diffInMinutes <= 10;

            return (
              <div
                key={index}
                className={`relative text-center shadow-md p-3 rounded-lg text-white transition-all duration-300 
                  ${isNearestPrayer ? "py-6 h-[100px]" : "py-3 h-[70px]"}  
                  ${bgColor}`}
              >
                <p className="text-sm font-semibold">
                  {prayer === "Lastthird" ? "Sepertiga Malam" : prayer}
                </p>
                <p className="text-lg font-bold">{time}</p>

                {/* Countdown hanya untuk waktu sholat terdekat */}
                {isRunning && isNearestPrayer && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[-40px] p-2 border rounded-lg shadow-md bg-white text-gray-800 w-auto">
                    <p className="text-lg font-bold">
                      {countdown !== null
                        ? formatTime(countdown)
                        : negativeCountdown !== null
                        ? `-${formatTime(negativeCountdown)}`
                        : "00:00"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <hr/>
      </div>
      <div className="mt-3 text-lg text-center bg-white bg-opacity-20 p-3 rounded-lg shadow-md">
       
      
        <h2 className="text-center text-4xl font-semibold text-blue-600">
          Jadwal Sholat Bulan 
          <br/>{todayPrayerTimes?.date?.hijri?.month?.en} {todayPrayerTimes?.date?.hijri?.year} H / {todayPrayerTimes?.date?.gregorian?.year} M
        </h2>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-max">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-500 text-white"> 
                <th className="border border-gray-300 p-2">Hari</th>
                <th className="border border-gray-300 p-2">Tanggal</th>
                {["Imsak", "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha", "Midnight"].map((name, idx) => (
                  <th key={idx} className="border border-gray-300 p-2">{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prayerTimes.map((day, index) => {

                if (!day?.date?.gregorian) return null;
                
                const isTodayRow = isToday(day?.date?.gregorian?.date);

                const dayNameEn = day?.date?.gregorian?.weekday?.en || "-";
                const dayNameIndo = translateDayToIndo(dayNameEn); // Ubah ke bahasa Indonesia

                return (
                  <tr key={index} className={`text-center ${isTodayRow ? "bg-yellow-200 font-bold" : ""}`}>
                     <td className="border border-gray-300 p-2">{dayNameIndo} <br/>{day?.date?.javaneseDay || "-"}</td> 
                     <td className="border border-gray-300 p-2">{day?.date?.gregorian?.day || "-"} {day?.date?.gregorian?.month?.en || "-"} {day?.date?.gregorian?.year || "-"} M<br/> {day?.date?.hijri?.day || "-"} {day?.date?.hijri?.month?.en || "-"} {day?.date?.hijri?.year || "-"} H </td>
                     {/*<td className="border border-gray-300 p-2">{dayNameIndo}</td> 
                     <td className="border border-gray-300 p-2">{day?.date?.gregorian?.date || "-"}</td>
                     {["Imsak", "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha", "Midnight"].map((key, idx) => (
                     <td key={idx} className="border border-gray-300 p-2">{(day?.timings?.[key])}</td>
                    ))} */}
                    {["Imsak", "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha", "Midnight"].map((key, idx) => {
                      const timing = day?.timings?.[key]?.replace("(+07)", "").trim();
                      return (
                        <td key={idx} className="border border-gray-300 p-2">{timing || "-"}</td>
                      );
                    })}
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
