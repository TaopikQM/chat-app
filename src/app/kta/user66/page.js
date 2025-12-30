"use client";

import { useEffect } from "react";
import { setupPresence } from "../../lib/presence";
import UserStatus from "../../components/UserStatus";

export default function KTAUser6() {
  const currentUser = "user66";
  const targetUser = "user55";

  useEffect(() => {
    return setupPresence(currentUser, "/kta/user66");
  }, []);

  return (
    <div className="p-6">
      <h1 className="font-bold text-xl">KTA USER 66</h1>

      <div className="mt-4">
        <p className="font-semibold">Status user55:</p>
        <UserStatus userId={targetUser} />
      </div>
    </div>
  );
}
