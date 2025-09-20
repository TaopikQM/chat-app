// // pages/api/download.js
// import fetch from "node-fetch";

// export default async function handler(req, res) {
//   const { url, filename } = req.query;

//   const response = await fetch(url); // ambil file dari Firebase
//   const buffer = await response.arrayBuffer();

//   res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
//   res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");

//   res.send(Buffer.from(buffer));
// }
// src/app/api/download/route.js
import fetch from "node-fetch";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const url = searchParams.get("url");
    const filename = searchParams.get("filename") || "download";

    if (!url) {
      return new Response(JSON.stringify({ error: "Missing url" }), { status: 400 });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch file" }), { status: 500 });
    }

    const arrayBuffer = await response.arrayBuffer();

    return new Response(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": response.headers.get("content-type") || "application/octet-stream",
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
