import ChatBox from '../components/ChatBox';

export default function User1ChatPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ChatBox pengirim="user1" penerima="user2" />
    </div>
  );
}
