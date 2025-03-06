export default async function handler(req, res) {
    try {
      const response = await fetch("https://web-api.nordvpn.com/v1/ips/info");
      const data = await response.json();
  
      // Set header agar bisa diakses dari frontend
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch IP data" });
    }
  }
  
