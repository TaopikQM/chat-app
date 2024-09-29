// Message.js
const Message = ({ message, userId }) => {
    const isSentByCurrentUser = message.sender === userId;

    return (
        <div className={`flex mb-2 ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-2 rounded-lg ${isSentByCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                {message.text}
                <span className="text-xs block">
                    {message.read ? "✅ Read" : "📬 Sent"}
                </span>
            </div>
        </div>
    );
};

export default Message;
