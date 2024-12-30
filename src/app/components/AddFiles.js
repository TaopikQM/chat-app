

import React, { useState } from 'react';
import { database, storage } from '../config/firebase';
// import { storage, rtdb } from '../config/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { ref as databaseRef, push, set,onValue, update } from "firebase/database";

const AddFiles = () => {
  const [uploadType, setUploadType] = useState("files"); // "files" or "folder"
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileNames, setFileNames] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    files.forEach(file => {
      setFileNames(prevFileNames => ({
        ...prevFileNames,
        [file.webkitRelativePath || file.name]: file.name // Default name
      }));
    });
  };

  const handleNameChange = (e, filePath) => {
    const newName = e.target.value;
    setFileNames(prevFileNames => ({
      ...prevFileNames,
      [filePath]: newName
    }));
  };

  const removeFile = (filePath) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => (file.webkitRelativePath || file.name) !== filePath));
    setFileNames(prevFileNames => {
      const newFileNames = { ...prevFileNames };
      delete newFileNames[filePath];
      return newFileNames;
    });
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files or a folder to upload.');
      return;
    }

    setIsLoading(true);

    try {
      const newEntryRef = push(databaseRef(database, 'chatFiles'));
      const newEntryKey = newEntryRef.key;

      const uploadPromises = selectedFiles.map(async (file) => {
        const filePath = file.webkitRelativePath || file.name;
        const fileRef = storageRef(storage, `chatFiles/${filePath}`);
        
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const currentDate = new Date();
        const jakartaOffset = 7 * 60 * 60 * 1000;
        const jakartaTime = new Date(currentDate.getTime() + jakartaOffset).toISOString();

        return {
          name: fileNames[filePath],
          url: downloadURL,
          createdTime: jakartaTime,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      await set(newEntryRef, {
        files: uploadedFiles,
      });

      alert('Files uploaded successfully!');
      setSelectedFiles([]);
      setFileNames({});
      window.location.reload();
    } catch (error) {
      console.error("Error uploading files:", error);
      alert('Error uploading files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
   <div className="flex flex-col items-center justify-center text-black p-6">
  <h2 className="text-2xl font-semibold mb-4">Upload Files or Folder</h2>

  {/* Toggle between File and Folder Upload */}
  <label className="mb-2">
    Select Upload Type:
    <select
      onChange={(e) => setUploadType(e.target.value)}
      value={uploadType}
      className="ml-2 border border-gray-300 rounded p-1"
    >
      <option value="files">Files</option>
      <option value="folder">Folder</option>
    </select>
  </label>

  {/* File/Folder Input */}
  <input
    type="file"
    multiple={uploadType === "files"}
    webkitdirectory={uploadType === "folder" ? "true" : undefined}
    onChange={handleFileChange}
    className="mt-4 border border-gray-300 rounded p-2 w-full max-w-md"
  />

  {/* Selected Files Preview */}
  <div className="mt-4 w-full max-w-md">
    {selectedFiles.map((file) => (
      <div key={file.webkitRelativePath || file.name} className="flex items-center justify-between border-b py-2">
        <span className="flex-1 text-gray-800">{file.webkitRelativePath || file.name}</span>

        {/* Name Input */}
        <input
          type="text"
          placeholder="Enter file name"
          value={fileNames[file.webkitRelativePath || file.name] || ""}
          onChange={(e) => handleNameChange(e, file.webkitRelativePath || file.name)}
          className="border border-gray-300 rounded p-1 ml-2 flex-1"
        />

        {/* Remove Button */}
        <button
          onClick={() => removeFile(file.webkitRelativePath || file.name)}
          className="ml-2 text-red-500 hover:text-red-700"
        >
          X
        </button>
      </div>
    ))}
  </div>

  {/* Submit Button */}
  <button
    type="button"
    onClick={handleSubmit}
    disabled={isLoading}
    className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  >
    {isLoading ? "Adding..." : "Add"}
  </button>
</div>

  );
};

export default AddFiles;

// // // import React, { useState } from 'react';
// // // import { storage, rtdb } from '../config/firebase';
// // // import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// // // import { ref as databaseRef, push, set } from "firebase/database";

// // // const AddFiles = () => {
// // //   const [selectedFiles, setSelectedFiles] = useState([]);
// // //   const [fileNames, setFileNames] = useState({});
// // //   const [isLoading, setIsLoading] = useState(false);

// // //   const handleFilesChange = (e) => {
// // //     const files = Array.from(e.target.files);
// // //     setSelectedFiles(prevFiles => [...prevFiles, ...files]);
// // //     files.forEach(file => {
// // //       setFileNames(prevFileNames => ({
// // //         ...prevFileNames,
// // //         [file.name]: file.name  // Default name is original file name
// // //       }));
// // //     });
// // //   };

// // //   const handleFolderChange = (e) => {
// // //     const files = Array.from(e.target.files);
// // //     setSelectedFiles(prevFiles => [...prevFiles, ...files]);
// // //     files.forEach(file => {
// // //       setFileNames(prevFileNames => ({
// // //         ...prevFileNames,
// // //         [file.webkitRelativePath || file.name]: file.name  // Preserve folder structure
// // //       }));
// // //     });
// // //   };

// // //   const handleNameChange = (e, filePath) => {
// // //     const newName = e.target.value;
// // //     setFileNames(prevFileNames => ({
// // //       ...prevFileNames,
// // //       [filePath]: newName
// // //     }));
// // //   };

// // //   const removeFile = (filePath) => {
// // //     setSelectedFiles(prevFiles => prevFiles.filter(file => (file.webkitRelativePath || file.name) !== filePath));
// // //     setFileNames(prevFileNames => {
// // //       const newFileNames = { ...prevFileNames };
// // //       delete newFileNames[filePath];
// // //       return newFileNames;
// // //     });
// // //   };

// // //   const handleSubmit = async () => {
// // //     if (selectedFiles.length === 0) {
// // //       alert('Please select files to upload.');
// // //       return;
// // //     }

// // //     setIsLoading(true);

// // //     try {
// // //       const newEntryRef = push(databaseRef(rtdb, 'product_L'));
// // //       const newEntryKey = newEntryRef.key;

// // //       const uploadPromises = selectedFiles.map(async (file) => {
// // //         const filePath = file.webkitRelativePath || file.name;
// // //         const fileRef = storageRef(storage, `product_L/${newEntryKey}/${filePath}`);
        
// // //         const snapshot = await uploadBytes(fileRef, file);
// // //         const downloadURL = await getDownloadURL(snapshot.ref);

// // //         const currentDate = new Date();
// // //         const jakartaOffset = 7 * 60 * 60 * 1000;
// // //         const jakartaTime = new Date(currentDate.getTime() + jakartaOffset).toISOString();

// // //         return {
// // //           name: fileNames[filePath],
// // //           url: downloadURL,
// // //           createdTime: jakartaTime,
// // //         };
// // //       });

// // //       const uploadedFiles = await Promise.all(uploadPromises);

// // //       await set(newEntryRef, {
// // //         files: uploadedFiles,
// // //       });

// // //       alert('Files uploaded successfully!');
// // //       setSelectedFiles([]);
// // //       setFileNames({});
// // //       window.location.reload();
// // //     } catch (error) {
// // //       console.error("Error uploading files:", error);
// // //       alert('Error uploading files. Please try again.');
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div>
// // //       <h2>Upload Files or Folders</h2>

// // //       {/* Individual Files Input */}
// // //       <label>
// // //         Select Files:
// // //         <input type="file" multiple onChange={handleFilesChange} />
// // //       </label>

// // //       {/* Folder Upload Input */}
// // //       <label>
// // //         Select Folder:
// // //         <input type="file" multiple webkitdirectory="true" onChange={handleFolderChange} />
// // //       </label>

// // //       {/* Selected Files Preview */}
// // //       <div style={{ marginTop: '20px' }}>
// // //         {selectedFiles.map((file) => (
// // //           <div key={file.webkitRelativePath || file.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
// // //             <span style={{ marginRight: '10px' }}>{file.webkitRelativePath || file.name}</span>

// // //             {/* Name Input */}
// // //             <input
// // //               type="text"
// // //               placeholder="Enter file name"
// // //               value={fileNames[file.webkitRelativePath || file.name] || ""}
// // //               onChange={(e) => handleNameChange(e, file.webkitRelativePath || file.name)}
// // //               style={{ marginRight: '10px' }}
// // //             />

// // //             {/* Remove Button */}
// // //             <button onClick={() => removeFile(file.webkitRelativePath || file.name)}>X</button>
// // //           </div>
// // //         ))}
// // //       </div>

// // //       {/* Submit Button */}
// // //       <button
// // //         type="button"
// // //         onClick={handleSubmit}
// // //         disabled={isLoading}
// // //         className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
// // //       >
// // //         {isLoading ? "Adding..." : "Add"}
// // //       </button>
// // //     </div>
// // //   );
// // // };

// // // export default AddFiles;

// // // // import React, { useState } from 'react';
// // // // import { storage, rtdb } from '../config/firebase';
// // // // import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// // // // import { ref as databaseRef, push, set } from "firebase/database";

// // // // const AddFiles = () => {
// // // //   const [selectedFiles, setSelectedFiles] = useState([]);
// // // //   const [fileNames, setFileNames] = useState({});
// // // //   const [isLoading, setIsLoading] = useState(false);

// // // //   const handleFileChange = (e) => {
// // // //     const files = Array.from(e.target.files);

// // // //     setSelectedFiles(prevFiles => [...prevFiles, ...files]);
// // // //     files.forEach(file => {
// // // //       setFileNames(prevFileNames => ({
// // // //         ...prevFileNames,
// // // //         [file.webkitRelativePath || file.name]: file.name  // Preserve folder path if available
// // // //       }));
// // // //     });
// // // //   };

// // // //   const handleNameChange = (e, filePath) => {
// // // //     const newName = e.target.value;
// // // //     setFileNames(prevFileNames => ({
// // // //       ...prevFileNames,
// // // //       [filePath]: newName
// // // //     }));
// // // //   };

// // // //   const removeFile = (filePath) => {
// // // //     setSelectedFiles(prevFiles => prevFiles.filter(file => (file.webkitRelativePath || file.name) !== filePath));
// // // //     setFileNames(prevFileNames => {
// // // //       const newFileNames = { ...prevFileNames };
// // // //       delete newFileNames[filePath];
// // // //       return newFileNames;
// // // //     });
// // // //   };

// // // //   const handleSubmit = async () => {
// // // //     if (selectedFiles.length === 0) {
// // // //       alert('Please select files to upload.');
// // // //       return;
// // // //     }

// // // //     setIsLoading(true);

// // // //     try {
// // // //       const newEntryRef = push(databaseRef(rtdb, 'product_L'));
// // // //       const newEntryKey = newEntryRef.key;

// // // //       const uploadPromises = selectedFiles.map(async (file) => {
// // // //         const filePath = file.webkitRelativePath || file.name;
// // // //         const fileRef = storageRef(storage, `product_L/${newEntryKey}/${filePath}`);
        
// // // //         const snapshot = await uploadBytes(fileRef, file);
// // // //         const downloadURL = await getDownloadURL(snapshot.ref);

// // // //         const currentDate = new Date();
// // // //         const jakartaOffset = 7 * 60 * 60 * 1000;
// // // //         const jakartaTime = new Date(currentDate.getTime() + jakartaOffset).toISOString();

// // // //         return {
// // // //           name: fileNames[filePath],
// // // //           url: downloadURL,
// // // //           createdTime: jakartaTime,
// // // //         };
// // // //       });

// // // //       const uploadedFiles = await Promise.all(uploadPromises);

// // // //       await set(newEntryRef, {
// // // //         files: uploadedFiles,
// // // //       });

// // // //       alert('Files uploaded successfully!');
// // // //       setSelectedFiles([]);
// // // //       setFileNames({});
// // // //       window.location.reload();
// // // //     } catch (error) {
// // // //       console.error("Error uploading files:", error);
// // // //       alert('Error uploading files. Please try again.');
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <div>
// // // //       <h2>Upload Files or Folders</h2>
// // // //       {/* Multi-file and folder selection */}
// // // //       <input type="file" multiple webkitdirectory="true" onChange={handleFileChange} />

// // // //       {/* Selected Files Preview */}
// // // //       <div style={{ marginTop: '20px' }}>
// // // //         {selectedFiles.map((file) => (
// // // //           <div key={file.webkitRelativePath || file.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
// // // //             <span style={{ marginRight: '10px' }}>{file.webkitRelativePath || file.name}</span>

// // // //             {/* Name Input */}
// // // //             <input
// // // //               type="text"
// // // //               placeholder="Enter file name"
// // // //               value={fileNames[file.webkitRelativePath || file.name] || ""}
// // // //               onChange={(e) => handleNameChange(e, file.webkitRelativePath || file.name)}
// // // //               style={{ marginRight: '10px' }}
// // // //             />

// // // //             {/* Remove Button */}
// // // //             <button onClick={() => removeFile(file.webkitRelativePath || file.name)}>X</button>
// // // //           </div>
// // // //         ))}
// // // //       </div>

// // // //       {/* Submit Button */}
// // // //       <button
// // // //         type="button"
// // // //         onClick={handleSubmit}
// // // //         disabled={isLoading}
// // // //         className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
// // // //       >
// // // //         {isLoading ? "Adding..." : "Add"}
// // // //       </button>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default AddFiles;

// // // // // import React, { useState } from 'react';
// // // // // import { storage, rtdb } from '../config/firebase';
// // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// // // // // import { ref as databaseRef, push, set } from "firebase/database";

// // // // // const AddFiles = () => {
// // // // //   const [selectedFiles, setSelectedFiles] = useState([]);
// // // // //   const [fileNames, setFileNames] = useState({});
// // // // //    const [isLoading, setIsLoading] = useState(false); // Tambahkan state isLoading
  

// // // // //   const handleFileChange = (e) => {
// // // // //     const files = Array.from(e.target.files);
// // // // //     setSelectedFiles(prevFiles => [...prevFiles, ...files]);
// // // // //     files.forEach(file => {
// // // // //       setFileNames(prevFileNames => ({
// // // // //         ...prevFileNames,
// // // // //        [file.webkitRelativePath || file.name]: file.name// Default custom name is the original file name
// // // // //       }));
// // // // //     });
// // // // //   };

// // // // //   const handleNameChange = (e, fileName) => {
// // // // //     const newName = e.target.value;
// // // // //     setFileNames(prevFileNames => ({
// // // // //       ...prevFileNames,
// // // // //       [fileName]: newName
// // // // //     }));
// // // // //   };

// // // // //   const removeFile = (fileName) => {
// // // // //     setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
// // // // //     setFileNames(prevFileNames => {
// // // // //       const newFileNames = { ...prevFileNames };
// // // // //       delete newFileNames[fileName];
// // // // //       return newFileNames;
// // // // //     });
// // // // //   };

// // // // //   const handleSubmit = async () => {
// // // // //     if (selectedFiles.length === 0) {
// // // // //       alert('Please select files to upload.');
// // // // //       return;
// // // // //     }
    
// // // // //     setIsLoading(true);

// // // // //     try {
// // // // //       // Push a new entry in the database to generate a unique key for the "product_L" entry
// // // // //       const newWisataRef = push(databaseRef(rtdb, 'product_L'));
// // // // //       const newWisataKey = newWisataRef.key;

// // // // //       // Upload each file and store its URL in the database
// // // // //       const uploadPromises = selectedFiles.map(async (file) => {
// // // // //          const filePath = file.webkitRelativePath || file.name;
       
// // // // //         const fileRef = storageRef(storage, `product_L/${newWisataKey}/${file.name}`);
        
// // // // //         // Upload the file to Firebase storage
// // // // //         const snapshot = await uploadBytes(fileRef, file);
        
// // // // //         // Get the download URL of the uploaded file
// // // // //         const downloadURL = await getDownloadURL(snapshot.ref);

        
// // // // //        // Calculate Jakarta time for createdTime
// // // // //         const currentDate = new Date();
// // // // //         const jakartaOffset = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds
// // // // //         const jakartaTime = new Date(currentDate.getTime() + jakartaOffset).toISOString();

// // // // //         return {
// // // // //           Name: fileNames[filePath],
// // // // //           url: downloadURL,
// // // // //           createdTime: jakartaTime,
// // // // //         };
// // // // //       });

// // // // //       // Wait for all uploads to complete and get the URLs
// // // // //       const uploadedFiles = await Promise.all(uploadPromises);

// // // // //       // Save the uploaded file URLs and custom names in the real-time database
// // // // //       await set(newWisataRef, {
// // // // //         files: uploadedFiles,
// // // // //       });

// // // // //       alert('Files uploaded successfully!');
      
// // // // //       // Clear the file selection after upload
// // // // //       setSelectedFiles([]);
// // // // //       setFileNames({});
// // // // //       window.location.reload();
// // // // //     } catch (error) {
// // // // //       console.error("Error uploading files:", error);
// // // // //       alert('Error uploading files. Please try again.');
// // // // //     }finally {
// // // // //       setIsLoading(false);
// // // // //     }
// // // // //   };

// // // // //   return (
// // // // //     <div>
// // // // //       <h2>Upload Files</h2>

// // // // //       {/* File Input */}
// // // // //        <input type="file" multiple webkitdirectory="true" onChange={handleFileChange} />


// // // // //       {/* Selected Files Preview */}
// // // // //       <div style={{ marginTop: '20px' }}>
// // // // //         {selectedFiles.map((file) => (
// // // // //           <div key={file.webkitRelativePath || file.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
// // // // //             <span style={{ marginRight: '10px' }}>{file.webkitRelativePath || file.name}</span>

// // // // //             <input
// // // // //               type="text"
// // // // //               placeholder="Enter file name"
// // // // //               value={fileNames[file.webkitRelativePath || file.name] || ""}
// // // // //               onChange={(e) => handleNameChange(e, file.webkitRelativePath || file.name)}
// // // // //               style={{ marginRight: '10px' }}
// // // // //             />

// // // // //             <button onClick={() => removeFile(file.webkitRelativePath || file.name)}>X</button>
// // // // //           </div>
// // // // //         ))}
// // // // //       </div>

// // // // //       {/* Submit Button */}
// // // // //         <button
// // // // //           type="handleSubmit"
// // // // //           onClick={handleSubmit}
// // // // //           disabled={isLoading} // Tambahkan properti disabled berdasarkan isLoading
// // // // //           className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
// // // // //         >
// // // // //          {isLoading ? "Loading..." : "Add"} {/* Ubah label tombol berdasarkan isLoading */}
     
// // // // //         </button>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default AddFiles;

// // // // // // import React, { useState } from 'react';
// // // // // // import { storage, rtdb } from '../config/firebase';
// // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// // // // // // import { ref as databaseRef, push, set, update } from "firebase/database";


// // // // // // const AddFiles = () => {
// // // // // //   const [name, setName] = useState('');
// // // // // //   const [price, setPrice] = useState('');
// // // // // //   const [rate, setRate] = useState('');
// // // // // //   const [images, setImages] = useState([]);
// // // // // //   const [isLoading, setIsLoading] = useState(false); // Tambahkan state isLoading
  
// // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);



// // // // // //   const handleFileChange = (event) => {
// // // // // //         const files = Array.from(event.target.files);
// // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // //     };
// // // // // //   const handleSubmit = async (e) => {
// // // // // //     e.preventDefault();
// // // // // //     setIsLoading(true); // Mulai proses upload
// // // // // //     try {
// // // // // //       const currentTime = new Date().toLocaleString();

// // // // // //       const newWisataRef = push(databaseRef(rtdb, 'product_L'));
// // // // // //       const newWisataKey = newWisataRef.key;

// // // // // //       const initialData = {
// // // // // //         name,
// // // // // //         status: "ACTIVE",
// // // // // //         createdAt: currentTime
// // // // // //       };

// // // // // //       await set(newWisataRef, initialData);

// // // // // //       console.log("Data saved to Realtime Database with key: ", newWisataKey);

// // // // // //       const fileUrls = await Promise.all(
// // // // // //         files.map(async (file) => {
// // // // // //           const fileRef = storageRef(storage, `product_L/${newWisataKey}/${file.name}`);
// // // // // //           await uploadBytes(fileRef, file);
// // // // // //           const fileUrl = await getDownloadURL(fileRef);
// // // // // //           console.log(`Uploaded file: ${file.name}, URL: ${fileUrl}`);
// // // // // //           return fileUrl;
// // // // // //         })
// // // // // //       );
      
// // // // // //       // Here, using update instead of set to avoid overwriting the entire node
// // // // // //       await update(databaseRef(rtdb, `product_L/${newWisataKey}`), {
// // // // // //         fileUrls // Updated variable name to reflect that it contains URLs of any file type
// // // // // //       });


// // // // // //       setName('');
     
// // // // // //       setImages([]);
      

// // // // // //       setIsLoading(false); // Selesai upload
// // // // // //       alert("Files added successfully!"); 
// // // // // //       window.location.reload(); // Refresh the page
// // // // // //     } catch (error) {
// // // // // //         setIsLoading(false); // Selesai upload dengan kesalahan
// // // // // //       console.error("Error adding document: ", error);
// // // // // //       alert("Error adding Files.");
// // // // // //     }
// // // // // //   };


// // // // // //   return (
// // // // // //     <form onSubmit={handleSubmit} className="space-y-4">
// // // // // //       <div>
// // // // // //         <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Files</label>
// // // // // //         <input
// // // // // //           type="text"
// // // // // //           id="name"
// // // // // //           value={name}
// // // // // //           onChange={(e) => setName(e.target.value)}
// // // // // //           className="mt-1 block h-9 w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
// // // // // //         />
// // // // // //       </div>
     
// // // // // //        <input
// // // // // //           type="file"
// // // // // //           id="images" // Changed the ID to a more generic name
// // // // // //           multiple
// // // // // //           accept="*/*" // This will allow all file types, including images and videos
// // // // // //           onChange={handleFileChange} // Changed the handler function name to reflect that it handles files
// // // // // //           className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
// // // // // //         />

        
// // // // // //         <button
// // // // // //           type="submit"
// // // // // //           disabled={isLoading} // Tambahkan properti disabled berdasarkan isLoading
// // // // // //           className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
// // // // // //         >
// // // // // //          {isLoading ? "Adding..." : "Add"} {/* Ubah label tombol berdasarkan isLoading */}
     
// // // // // //         </button>

// // // // // //         {/* Tampilkan popup loading saat isLoading true */}
// // // // // //         {isLoading && (
// // // // // //             <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
// // // // // //                 <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
// // // // // //             </div>
// // // // // //             )}
// // // // // //       </form>
// // // // // //   );
// // // // // // };

// // // // // // export default AddFiles;
