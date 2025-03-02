import AdminChatTable from "../components/AdminChatTable";
import LAdminChatTable from "../components/LAdminChatTable";
import UsersChatTable from "../components/UsersChatTable";
import LUsersChatTable from "../components/LUsersChatTable";

export default function AdminPage() {
  return (
    <>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <AdminChatTable />
    </div>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <LAdminChatTable />
    </div>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <UsersChatTable />
    </div>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <LUsersChatTable />
    </div>
    </>
  );
}
