export function formatLastSeen(lastSeen, now) {
  if (!lastSeen) return "-";

  const diff = Math.floor((now - lastSeen) / 1000);

  if (diff < 60) return `${diff} detik lalu`;

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `${hours} jam ${minutes % 60} menit lalu`;

  const date = new Date(lastSeen);
  const wib = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );

  const pad = (n) => n.toString().padStart(2, "0");

  return `${pad(wib.getHours())}:${pad(wib.getMinutes())}:${pad(
    wib.getSeconds()
  )} WIB
${pad(wib.getDate())}-${pad(wib.getMonth() + 1)}-${wib.getFullYear()}`;
}
