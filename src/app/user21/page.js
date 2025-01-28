import ChatBox from '../components/ChatBox';

export default function User2ChatPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ChatBox pengirim="user2" penerima="user1" />
    </div>
  );
}
