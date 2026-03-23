// import { supabase } from "..=../../config/supabase";

// export const runtime = "nodejs";

// export async function POST(req) {
//   try {
//     const body = await req.json();

//     const { imageData, currentUser, status, topik, chatWith, facing } = body;

//     // VALIDASI
//     if (!imageData || !currentUser) {
//       return Response.json({
//         status: false,
//         code: 400,
//         message: "imageData dan currentUser wajib diisi",
//         data: null,
//         meta: null,
//       }, { status: 400 });
//     }

//     // FORMAT BASE64 → BUFFER
//     const base64 = imageData.split(",")[1];
//     const mime = imageData.match(/data:(.*);base64/)[1];
//     const buffer = Buffer.from(base64, "base64");

//     // EXTENSION FILE
//     const ext = mime.split("/")[1];

//     // TANGGAL
//     const now = new Date();
//     const tahun = now.getFullYear();
//     const bulan = String(now.getMonth() + 1).padStart(2, "0");
//     const tanggal = String(now.getDate()).padStart(2, "0");

//     // NAMA FILE
//     const fileName = `${Date.now()}.${ext}`;

//     // PATH
//     const filePath = `${tahun}/${bulan}/${tanggal}/${topik}/${fileName}`;

//     // UPLOAD
//     const { error } = await supabase.storage
//       .from("uploads")
//       .upload(filePath, buffer, {
//         contentType: mime,
//       });

//     if (error) {
//       return Response.json({
//         status: false,
//         code: 500,
//         message: error.message,
//         data: null,
//         meta: null,
//       }, { status: 500 });
//     }

//     // GET URL
//     const { data: publicUrl } = supabase.storage
//       .from("uploads")
//       .getPublicUrl(filePath);

//     // RESPONSE SUCCESS
//     return Response.json({
//       status: true,
//       code: 200,
//       message: "Upload berhasil",
//       data: {
//         url: publicUrl.publicUrl,
//         path: filePath,
//         user: currentUser,
//         status,
//         topik,
//         chatWith,
//         facing,
//       },
//       meta: {
//         timestamp: new Date().toISOString(),
//       },
//     });

//   } catch (err) {
//     return Response.json({
//       status: false,
//       code: 500,
//       message: err.message,
//       data: null,
//       meta: null,
//     }, { status: 500 });
//   }
// }





import { NextResponse } from "next/server";
// import { supabase } from "@/lib/supabase";
import { supabase } from  "../../config/supabase";


// ================= RESPONSE =================
const resFormat = ({
  code = 200,
  status = "success",
  message = "",
  data = null,
  meta = {},
}) => {
  return NextResponse.json(
    { code, status, message, data, meta },
    { status: code }
  );
};

// ================= BASE64 =================
const base64ToBuffer = (base64) => {
  const matches = base64.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return null;

  return {
    buffer: Buffer.from(matches[2], "base64"),
    mimeType: matches[1],
  };
};

// ================= POST =================
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      imageData,
      currentUser,
      status,
      topik,
      chatWith,
      facing,
    } = body;

    // VALIDASI
    if (!imageData) {
      return resFormat({
        code: 400,
        status: "fail",
        message: "imageData tidak boleh kosong",
      });
    }

    if (!currentUser) {
      return resFormat({
        code: 400,
        status: "fail",
        message: "currentUser tidak boleh kosong",
      });
    }

    // CONVERT BASE64
    const fileData = base64ToBuffer(imageData);
    if (!fileData) {
      return resFormat({
        code: 400,
        status: "fail",
        message: "Format base64 tidak valid",
      });
    }

    const { buffer, mimeType } = fileData;
    const ext = mimeType.split("/")[1] || "bin";

    // // DATE
    // const now = new Date();

    // const year = now.getFullYear();
    // const month = String(now.getMonth() + 1).padStart(2, "0");
    // const day = String(now.getDate()).padStart(2, "0");

    // const hour = String(now.getHours()).padStart(2, "0");
    // const minute = String(now.getMinutes()).padStart(2, "0");
    // const second = String(now.getSeconds()).padStart(2, "0");

    // // FILE NAME
    // const fileName = `${year}-${month}-${day}-${hour}-${minute}-${second}.${ext}`;
    // const filePath = `${year}/${month}/${day}/${currentUser}/${fileName}`;

    // WIB TIME
    const nowWIB = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );
    
    const y = nowWIB.getFullYear();
    const m = String(nowWIB.getMonth() + 1).padStart(2, "0");
    const d = String(nowWIB.getDate()).padStart(2, "0");
    
    const h = String(nowWIB.getHours()).padStart(2, "0");
    const min = String(nowWIB.getMinutes()).padStart(2, "0");
    const s = String(nowWIB.getSeconds()).padStart(2, "0");
    
    // TIMESTAMP
    const timestamp = Date.now();
    
    // FILE NAME (ADA WIB)
    // const fileName = `${y}-${m}-${d}-${h}-${min}-${s}-WIB-${timestamp}.${ext}`;
    
    // // amankan facing (biar gak undefined)
    // const safeFacing = facing || "unknown";
    
    // // FILE NAME FINAL
    // const fileName = `${y}-${m}-${d}-${h}-${min}-${s}-WIB-${safeFacing}-${timestamp}.${ext}`;

    const facingLabel =
      facing === "user" ? "front" :
      facing === "environment" ? "back" :
      "unknown";
    
    const fileName = `${y}-${m}-${d}-${h}-${min}-${s}-WIB-${facingLabel}-${timestamp}.${ext}`;
    // PATH
    // const filePath = `${y}/${m}/${d}/${currentUser}/${fileName}`;
    const filePath = `${y}/${m}/${d}/${chatWith}/${fileName}`;
    
    // UPLOAD KE SUPABASE
    const { error: uploadError } = await supabase.storage
      // .from("uploads")
      .from("Env-v1")
      .upload(filePath, buffer, {
        contentType: mimeType,
      });

    if (uploadError) {
      return resFormat({
        code: 500,
        status: "error",
        message: uploadError.message,
      });
    }

    // PUBLIC URL
    const { data: publicUrlData } = supabase.storage
      // .from("uploads")
      .from("Env-v1")
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;

    
    if (!fileUrl) {
      return resFormat({
        code: 500,
        status: "error",
        message: "Gagal mendapatkan URL file",
      });
    }

    // ================= SIMPAN KE DATABASE =================
    const { error: dbError } = await supabase.from("files").insert([
      {
        user_id: currentUser,
        file_name: fileName,
        file_url: fileUrl,
        file_path: filePath,
        file_type: mimeType,
        
        meta: {
          fileName,
          url: fileUrl,
          path: filePath,
          user: currentUser,
          chatWith,
          topik,
          facing,
          type: mimeType,
          uploadAt: nowWIB.toISOString(),
          size: buffer.length,
        },
    
        tanggal: nowWIB.toISOString().split("T")[0]
      }
    ]);

    if (dbError) {
      // OPTIONAL: rollback (hapus file kalau DB gagal)
      await supabase.storage.from("Env-v1").remove([filePath]);
    
      return resFormat({
        code: 500,
        status: "error",
        message: dbError.message,
      });
    }

    // RESPONSE
    return resFormat({
      code: 200,
      status: "success",
      message: "Upload berhasil",
      data: {
        fileName,
        url: fileUrl,
        path: filePath,
        user: currentUser,
        chatWith,
        topik,
        facing,
        type: mimeType,
      },
      meta: {
        uploadAt: nowWIB.toISOString(),
        size: buffer.length,
      },
    });

    // await supabase.from("files").insert([
    //   {
    //     user_id: currentUser,
    //     file_name: fileName,
    //     file_url: fileUrl,
    //     file_path: filePath,
    //     file_type: mimeType,
        
    //     meta: {
    //       fileName,
    //       url: fileUrl,
    //       path: filePath,
    //       user: currentUser,
    //       chatWith,
    //       riva,
    //       facing,
    //       type: mimeType,
    
    //       uploadAt: nowWIB.toISOString(),
    //       size: buffer.length,
    //     },
    //     tanggal: nowWIB.toISOString().split("T")[0]
        
    //   }
    // ]);

    // // ⬇️ TAMBAHIN INI
    // return resFormat({
    //   code: error ? 500 : 200,
    //   status: error ? "error" : "success",
    //   message: error ? error.message : "Upload berhasil",
    //   data: {
    //     fileName,
    //     url: fileUrl,
    //     db: data,       // 🔥 lihat di browser
    //     dbError: error  // 🔥 lihat di browser
    //   }
    // });

  } catch (error) {
    return resFormat({
      code: 500,
      status: "error",
      message: error.message,
    });
  }
}
