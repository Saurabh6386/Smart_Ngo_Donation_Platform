import { useState, useContext } from "react";
import ChatContext from "../../context/ChatContext";
import AuthContext from "../../context/AuthContext";

export default function MessageItem({ message, isOwn }) {
  const { deleteMessage } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = () => {
    const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
    deleteMessage(message._id, token);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg relative group ${
          isOwn
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-300 text-black rounded-bl-none"
        }`}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
      >
        <p className="text-sm">{message.text}</p>
        <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-600"}`}>
          {formatTime(message.createdAt)}
        </p>

        {isOwn && showDelete && (
          <button
            onClick={handleDelete}
            className="absolute -right-8 top-0 text-red-500 hover:text-red-700 text-xs"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
