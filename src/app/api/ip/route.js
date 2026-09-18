   // File: src/app/api/ip/route.js
export async function GET() {
  try {
    const response = await fetch("https://web-api.nordvpn.com/v1/ips/info");
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch IP data" }), {
      status: 500,
    });
  }
}
