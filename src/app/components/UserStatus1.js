// "use client";

// import { useEffect, useState } from "react";
// import { ref, onValue } from "firebase/database";
// import { database } from "../config/firebase";
// import { useNow } from "../hooks/useNow";
// import { formatLastSeen } from "../config/lastSeen";

// export default function UserStatus({ userId }) {
//   const [status, setStatus] = useState(null);
//   const now = useNow();

//   useEffect(() => {
//     const r = ref(database, `statusOnline/${userId}`);
//     return onValue(r, snap => {
//       setStatus(snap.val());
//     });
//   }, [userId]);

//   if (!status) return null;

//   return (
//     <p className="text-xs text-gray-500">
//       {status.isOnline
//         ? "🟢 Online"
//         : `Terakhir online ${formatLastSeen(status.lastSeen, now)}`}
//     </p>
//   );
// }

"use client";

import { useUserStatus } from "../hooks/useUserStatus";
import { useNow } from "../hooks/useNow";
import { formatLastSeen } from "../config/lastSeen";

export default function UserStatus({ userId }) {
  const status = useUserStatus(userId);
  const now = useNow();

  if (!status) return null;

  return (
    <p className="text-xs text-gray-500">
      {status.isOnline
        ? "🟢 Online"
        : `Terakhir online ${formatLastSeen(status.lastSeen, now)}`}
    </p>
  );
}
