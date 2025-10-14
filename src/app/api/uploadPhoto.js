import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage, storageBackup } from "../config/firebase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      code: 405,
      status: "fail",
      message: "Method not allowed",
      data: null,
      meta: {}
    });
  }

  try {
    const { imageData, currentUser, status, chatWith,facing } = req.body;

    if (!imageData) {
      return res.status(400).json({
        code: 400,
        status: "fail",
        message: "imageData  tidak boleh kosong",
        data: null,
        meta: {}
      });
    }

    const timestamp = Date.now();
    // const filePath = `user_captures/${currentUser}_${status}_${timestamp}.png`;
    const folderName = chatWith ? `user_captures_${chatWith}` : "user_captures";

    const filePath = `${folderName}/${
      chatWith || currentUser
    }_${status}_${facing || "unknown"}_${timestamp}.png`;

    // pilih storage utama dulu
    // pilih storage utama dulu
    let storageUsed = "main";
    let fileRef = ref(storage, filePath);

    try {
      await uploadString(fileRef, imageData, "data_url");
    } catch (err) {
      console.warn("Upload ke storage utama gagal, fallback ke backup:", err);
      storageUsed = "backup";
      fileRef = ref(storageBackup, filePath);
      await uploadString(fileRef, imageData, "data_url");
    }

    const downloadURL = await getDownloadURL(fileRef);

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Upload berhasil",
      data: { downloadURL, storageUsed },
      meta: {}
    });
  } catch (err) {
    console.error("Upload photo failed:", err);
    res.status(500).json({
      code: 500,
      status: "fail",
      message: err.message || "Terjadi kesalahan",
      data: null,
      meta: {}
    });
  }
}
