import { useEffect, useState } from "react";
// import { rtdb, ref, onValue } from "../config/firebase";

import { database, storage } from "../config/firebase";
import { ref as databaseRef, push, update,set ,onValue} from "firebase/database";
import { formatDistanceToNow, format  } from "date-fns";

const UserStatus = ({ userId }) => {
  const [lastSeen, setLastSeen] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const userRef = databaseRef(database, `pengguna/${userId}`);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setIsOnline(data.isOnline);
        setLastSeen(data.lastSeen);
      }
    });
  }, [userId]);
  const isMoreThan5MinutesAgo = lastSeen && new Date().getTime() - new Date(lastSeen).getTime() > 5 * 60 * 1000;

  return (
    <div className="text-center text-gray-600 text-sm">
      {isOnline ? (
        <span className="text-green-500 font-semibold">Online</span>
      ) : lastSeen ? (
        <>
          <span>
            {isMoreThan5MinutesAgo ? (
              <>
                {/* Jika lebih dari 5 menit, tampilkan tanggal dan waktu lengkap */}
                Terakhir dilihat: {format(new Date(lastSeen), "dd-MM-yyyy HH:mm:ss")}
              </>
            ) : (
              // Jika kurang dari 5 menit, tampilkan waktu relatif
              `Terakhir dilihat ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`
            )}
          </span>
        </>
      ) : (
        "Tidak tersedia"
      )}
    </div>
  );
  // return (
  //   <div className="text-center text-gray-600 text-sm">
  //     {isOnline ? (
  //       <span className="text-green-500 font-semibold">Online</span>
  //     ) : lastSeen ? (
  //       <>
  //         <span>
  //           Terakhir dilihat{" "}
  //           {formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}
  //         </span>
  //         <div>
  //           {/* Format tanggal dan waktu */}
  //           <span>
  //             {format(new Date(lastSeen), "dd-MM-yyyy HH:mm:ss")}
  //           </span>
  //         </div>
  //       </>
  //     ) : (
  //       "Tidak tersedia"
  //     )}
  //   </div>
  // );
};

//   return (
//     <div className="text-center text-gray-600 text-sm">
//       {isOnline ? (
//         <span className="text-green-500 font-semibold">Online</span>
//       ) : lastSeen ? (
//         `Terakhir dilihat ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`
//       ) : (
//         "Tidak tersedia"
//       )}
//     </div>
//   );
// };

export default UserStatus;
