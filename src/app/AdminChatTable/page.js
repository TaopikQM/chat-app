import AdminChatTable from "../components/AdminChatTable";
import LAdminChatTable from "../components/LAdminChatTable";
import UsersChatTable from "../components/UsersChatTable";
import LUsersChatTable from "../components/LUsersChatTable";

export default function AdminPage() {
  const [open, setOpen] = useState(null); // null = semua tertutup

  const toggle = (key) => {
    setOpen(open === key ? null : key); // kalau klik yang sama, tutup
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-10 space-y-6">
      {/* Admin Chat */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-4">
        <button
          onClick={() => toggle("Chat User")}
          className="w-full text-lg font-bold py-2 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Admin Chat Table
        </button>
        {open === "Chat User" && (
          <div className="mt-4">
            <AdminChatTable />
          </div>
        )}
      </div>

      {/* LAdmin Chat */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-4">
        <button
          onClick={() => toggle("Sampah Chat")}
          className="w-full text-lg font-bold py-2 px-4 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
        >
          LAdmin Chat Table
        </button>
        {open === "Sampah Chat" && (
          <div className="mt-4">
            <LAdminChatTable />
          </div>
        )}
      </div>

      {/* Users Chat */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-4">
        <button
          onClick={() => toggle("Users")}
          className="w-full text-lg font-bold py-2 px-4 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          Users Chat Table
        </button>
        {open === "Users" && (
          <div className="mt-4">
            <UsersChatTable />
          </div>
        )}
      </div>

      {/* LUsers Chat */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-4">
        <button
          onClick={() => toggle("Log Users")}
          className="w-full text-lg font-bold py-2 px-4 rounded-xl bg-pink-600 text-white hover:bg-pink-700 transition"
        >
          LUsers Chat Table
        </button>
        {open === "Log Users" && (
          <div className="mt-4">
            <LUsersChatTable />
          </div>
        )}
      </div>
    </div>
  );
            }
            {/* return (
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
}*/}
