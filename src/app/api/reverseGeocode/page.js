export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  
    const { lat, lon } = req.body;
  
    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude dan Longitude diperlukan" });
    }
  
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        { headers: { "User-Agent": "MyApp" } }
      );
  
      if (!response.ok) throw new Error("Gagal mengambil data lokasi");
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
