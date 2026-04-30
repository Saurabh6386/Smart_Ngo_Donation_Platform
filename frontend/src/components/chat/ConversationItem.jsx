import { useContext } from "react";
import ChatContext from "../../context/ChatContext";

export default function ConversationItem({ conversation, isActive, onClick }) {
  const otherUser = conversation.participants.find(
    (p) => p._id !== JSON.parse(localStorage.getItem("userInfo"))?._id
  );

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b cursor-pointer transition-colors ${
        isActive
          ? "bg-blue-100 border-blue-400"
          : "hover:bg-gray-100 border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={otherUser?.profilePic}
          alt={otherUser?.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1 overflow-hidden">
          <h3 className="font-semibold text-gray-800">{otherUser?.name}</h3>
          <p className="text-sm text-gray-600 truncate">
            {conversation.lastMessage?.text || "No messages yet"}
          </p>
        </div>
        {conversation.lastMessageTime && (
          <span className="text-xs text-gray-500">
            {new Date(conversation.lastMessageTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
