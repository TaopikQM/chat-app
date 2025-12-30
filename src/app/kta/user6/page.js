"use client";

import { useEffect } from "react";
import { setupPresence } from "../../config/presence";
import UserStatus from "../../components/UserStatus";

export default function KTAUser6() {
  const currentUser = "user6";
  const targetUser = "user5";

  useEffect(() => {
    return setupPresence(currentUser, "/kta/user6");
  }, []);

  return (
    <div className="p-6">
      <h1 className="font-bold text-xl">KTA USER 6</h1>

      <div className="mt-4">
        <p className="font-semibold">Status user5:</p>
        <UserStatus userId={targetUser} />
      </div>
    </div>
  );
}
