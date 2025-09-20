// // // pages/api/download.js
// // import fetch from "node-fetch";

// // export default async function handler(req, res) {
// //   const { url, filename } = req.query;

// //   const response = await fetch(url); // ambil file dari Firebase
// //   const buffer = await response.arrayBuffer();

// //   res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
// //   res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");

// //   res.send(Buffer.from(buffer));
// // }

// import archiver from "archiver";
// import fetch from "node-fetch";

// export default async function handler(req, res) {
//   try {
//     const { urls } = req.query;
//     if (!urls) {
//       return res.status(400).json({ error: "No urls provided" });
//     }

//     // Parse dari query
//     const files = JSON.parse(urls);

//     if (!Array.isArray(files) || files.length === 0) {
//       return res.status(400).json({ error: "Invalid urls format" });
//     }

//     // Kalau hanya 1 file -> langsung stream
//     if (files.length === 1) {
//       const { url, filename } = files[0];
//       const response = await fetch(url);

//       if (!response.ok) {
//         return res.status(500).json({ error: "Failed to fetch file" });
//       }

//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename="${filename || "download"}"`
//       );
//       res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");

//       response.body.pipe(res);
//       return;
//     }

//     // // Kalau lebih dari 1 file -> zip
//     // res.setHeader(
//     //   "Content-Disposition",
//     //   `attachment; filename="files.zip"`
//     // );
//     // res.setHeader("Content-Type", "application/zip");

//     // const archive = archiver("zip", { zlib: { level: 9 } });
//     // archive.pipe(res);

//     // for (const { url, filename } of files) {
//     //   const response = await fetch(url);
//     //   if (response.ok) {
//     //     archive.append(response.body, { name: filename || "file" });
//     //   }
//     // }

//     // await archive.finalize();
//     // Kalau lebih dari 1 file -> zip
// const now = new Date();
// const options = {
//   timeZone: "Asia/Jakarta",
//   year: "numeric",
//   month: "2-digit",
//   day: "2-digit",
//   hour: "2-digit",
//   minute: "2-digit",
//   second: "2-digit",
// };
// let dateStr = new Intl.DateTimeFormat("id-ID", options).format(now);

// // Format aman untuk nama file
// dateStr = dateStr
//   .replace(/\./g, "")
//   .replace(/\//g, "")
//   .replace(/,/g, "")
//   .replace(/\s+/g, "_")
//   .replace(/:/g, "");

// const zipName = `files_${dateStr}.zip`;

// res.setHeader(
//   "Content-Disposition",
//   `attachment; filename="${zipName}"`
// );
// res.setHeader("Content-Type", "application/zip");

// const archive = archiver("zip", { zlib: { level: 9 } });
// archive.pipe(res);

// for (const { url, filename } of files) {
//   const response = await fetch(url);
//   if (response.ok) {
//     archive.append(response.body, { name: filename || "file" });
//   }
// }

// await archive.finalize();

//   } catch (err) {
//     console.error("Download error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }
import archiver from "archiver";

// Next.js App Router API style
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const urls = searchParams.get("urls");

    if (!urls) {
      return new Response(JSON.stringify({ error: "No urls provided" }), {
        status: 400,
      });
    }

    const files = JSON.parse(urls);

    if (!Array.isArray(files) || files.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid urls format" }), {
        status: 400,
      });
    }

    // Single file
    if (files.length === 1) {
      const { url, filename } = files[0];
      const response = await fetch(url);

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch file" }),
          { status: 500 }
        );
      }

      return new Response(response.body, {
        headers: {
          "Content-Disposition": `attachment; filename="${filename || "download"}"`,
          "Content-Type":
            response.headers.get("content-type") ||
            "application/octet-stream",
        },
      });
    }

    // Multiple files -> ZIP
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    let dateStr = formatter
      .format(now)
      .replace(/\./g, "")
      .replace(/\//g, "")
      .replace(/,/g, "")
      .replace(/\s+/g, "_")
      .replace(/:/g, "");
    const zipName = `files_${dateStr}.zip`;

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(new WritableStream({ write: chunk => writer.write(chunk) }));

    for (const { url, filename } of files) {
      const response = await fetch(url);
      if (response.ok) {
        archive.append(response.body, { name: filename || "file" });
      }
    }

    archive.finalize().then(() => writer.close());

    return new Response(readable, {
      headers: {
        "Content-Disposition": `attachment; filename="${zipName}"`,
        "Content-Type": "application/zip",
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
