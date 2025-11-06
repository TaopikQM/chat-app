// File: src/app/api/uploadPhoto/route.js
import { NextResponse } from "next/server";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage, storageBackup } from "../../config/firebase"; // sesuaikan path

export async function POST(request) {
  try {
    const body = await request.json(); 
    const { imageData, currentUser, status, chatWith, facing } = body;

    if (!imageData) {
      return NextResponse.json(
        {
          code: 400,
          status: "fail",
          message: "imageData tidak boleh kosong",
          data: null,
          meta: {},
        },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const folderName = chatWith ? `user_captures_${chatWith}` : "user_captures";
    // const folderName = currentUser ? `userin_captures_${currentUser}` : "userin_captures";
    const filePath = `${folderName}/${
      // currentUser || chatWith
     chatWith || currentUser 
      
    }_${status}_${facing || "unknown"}_${timestamp}.png`;

    // pilih storage utama dulu
    let storageUsed = "main";
    let fileRef = ref(storage, filePath);
// let fileRef = ref(storageBackup, filePath);
    try {
      await uploadString(fileRef, imageData, "data_url");
    } catch (err) {
      console.warn("Upload ke storage utama gagal, fallback ke backup:", err);
      storageUsed = "backup";
      fileRef = ref(storageBackup, filePath);
      await uploadString(fileRef, imageData, "data_url");
    }

    const downloadURL = await getDownloadURL(fileRef);

    return NextResponse.json({
      code: 200,
      status: "success",
      message: "Upload berhasil",
      data: { downloadURL, storageUsed, filePath },
      meta: {},
    });
  } catch (err) {
    console.error("Upload photo failed:", err);
    return NextResponse.json(
      {
        code: 500,
        status: "fail",
        message: err.message || "Terjadi kesalahan",
        data: null,
        meta: {},
      },
      { status: 500 }
    );
  }
}
