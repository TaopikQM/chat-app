import { supabase } from "..=../../config/supabase";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();

    const { imageData, currentUser, status, topik, chatWith, facing } = body;

    // VALIDASI
    if (!imageData || !currentUser) {
      return Response.json({
        status: false,
        code: 400,
        message: "imageData dan currentUser wajib diisi",
        data: null,
        meta: null,
      }, { status: 400 });
    }

    // FORMAT BASE64 → BUFFER
    const base64 = imageData.split(",")[1];
    const mime = imageData.match(/data:(.*);base64/)[1];
    const buffer = Buffer.from(base64, "base64");

    // EXTENSION FILE
    const ext = mime.split("/")[1];

    // TANGGAL
    const now = new Date();
    const tahun = now.getFullYear();
    const bulan = String(now.getMonth() + 1).padStart(2, "0");
    const tanggal = String(now.getDate()).padStart(2, "0");

    // NAMA FILE
    const fileName = `${Date.now()}.${ext}`;

    // PATH
    const filePath = `${tahun}/${bulan}/${tanggal}/${topik}/${fileName}`;

    // UPLOAD
    const { error } = await supabase.storage
      .from("uploads")
      .upload(filePath, buffer, {
        contentType: mime,
      });

    if (error) {
      return Response.json({
        status: false,
        code: 500,
        message: error.message,
        data: null,
        meta: null,
      }, { status: 500 });
    }

    // GET URL
    const { data: publicUrl } = supabase.storage
      .from("uploads")
      .getPublicUrl(filePath);

    // RESPONSE SUCCESS
    return Response.json({
      status: true,
      code: 200,
      message: "Upload berhasil",
      data: {
        url: publicUrl.publicUrl,
        path: filePath,
        user: currentUser,
        status,
        topik,
        chatWith,
        facing,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });

  } catch (err) {
    return Response.json({
      status: false,
      code: 500,
      message: err.message,
      data: null,
      meta: null,
    }, { status: 500 });
  }
}
