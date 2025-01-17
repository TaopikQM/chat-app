// pages/api/getPrayerTimes.js
export async function handler(req, res) {
    const { latitude, longitude } = req.query;
    const url = `http://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code === 200) {
        res.status(200).json(data.data.timings);
    } else {
        res.status(500).json({ error: "Failed to fetch prayer times" });
    }
}
