"use client";

import { useEffect } from "react";
import { setupPresence } from "../../lib/presence";
import UserStatus from "../../components/UserStatus";

export default function KTAUser5() {
  const currentUser = "user55";
  const targetUser = "user66";

  useEffect(() => {
    return setupPresence(currentUser, "/kta/user55");
  }, []);

  return (
    <div className="p-6">
      <h1 className="font-bold text-xl">KTA USER 55</h1>

      <div className="mt-4">
        <p className="font-semibold">Status user66:</p>
        <UserStatus userId={targetUser} />
      </div>
    </div>
  );
}
