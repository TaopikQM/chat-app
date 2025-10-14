// File: src/app/api/chat/upload/route.js
import { NextResponse } from "next/server";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, storageBackup } from "../../../config/firebase"; // sesuaikan path

export async function POST(request) {
  try {
    const body = await request.json();
    const { files, audioFile, messageKey } = body;

    if ((!files || files.length === 0) && !audioFile) {
      return NextResponse.json(
        { status: "fail", message: "Tidak ada file untuk diupload" },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    // Fungsi helper upload dengan fallback backup
    const uploadWithBackup = async (storagePath, fileData, isAudio = false) => {
      let storageUsed = "main";
      let fileRef = ref(storage, storagePath);

      try {
        await uploadBytes(fileRef, fileData);
      } catch (err) {
        console.warn(`⚠️ Upload gagal di main (${storagePath}), fallback backup...`);
        storageUsed = "backup";
        fileRef = ref(storageBackup, storagePath);
        await uploadBytes(fileRef, fileData);
      }

      const url = await getDownloadURL(fileRef);
      return { url, storageUsed };
    };

    // === Upload semua file ===
    if (files && files.length > 0) {
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const storagePath = `chatFiles/${messageKey}_${Date.now()}_${file.name}`;

        // Convert Base64 ke Blob jika file.data ada
        let fileBlob = null;
        if (file.data) {
          const byteCharacters = atob(file.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          fileBlob = new Blob([byteArray], { type: file.type || "application/octet-stream" });
        }

        const { url, storageUsed } = await uploadWithBackup(storagePath, fileBlob);
        uploadedFiles.push({
          url,
          type: file.type?.split("/")[0] || "file",
          name: file.name,
          storageUsed,
        });
      }
    }

    // === Upload audio jika ada ===
    let uploadedAudio = null;
    if (audioFile && audioFile.data) {
      const audioPath = `chatFiles/${messageKey}_${Date.now()}.wav`;

      // Convert base64 ke Blob
      const byteCharacters = atob(audioFile.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const audioBlob = new Blob([byteArray], { type: "audio/wav" });

      const { url, storageUsed } = await uploadWithBackup(audioPath, audioBlob, true);
      uploadedAudio = url;

      uploadedFiles.push({
        url,
        type: "audio",
        name: `${messageKey}.wav`,
        storageUsed,
      });
    }

    return NextResponse.json({
      code: 200,
      status: "success",
      message: "Upload berhasil",
      data: {
        uploadedFiles,
        audio: uploadedAudio,
      },
    });
  } catch (err) {
    console.error("❌ Upload failed:", err);
    return NextResponse.json(
      {
        code: 500,
        status: "fail",
        message: err.message || "Terjadi kesalahan internal",
      },
      { status: 500 }
    );
  }
}
