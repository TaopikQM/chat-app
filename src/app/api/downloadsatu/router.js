// pages/api/download.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url, filename } = req.query;

  const response = await fetch(url); // ambil file dari Firebase
  const buffer = await response.arrayBuffer();

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");

  res.send(Buffer.from(buffer));
}
