import { useContext, useEffect, useState, useRef } from "react";
import ChatContext from "../context/ChatContext";
import AuthContext from "../context/AuthContext";
import MessageItem from "../components/chat/MessageItem";
import ConversationItem from "../components/chat/ConversationItem";
import UserSearch from "../components/chat/UserSearch";

export default function Chat() {
  const { user } = useContext(AuthContext);
  const {
    conversations,
    activeConversation,
    messages,
    typingStatus,
    setActiveConversation,
    initializeSocket,
    fetchConversations,
    fetchMessages,
    sendMessage,
    emitTyping,
    emitStopTyping,
  } = useContext(ChatContext);

  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle user selection from search
  const handleSelectUser = (selectedUser) => {
    // Check if conversation already exists
    const existingConversation = conversations.find((conv) =>
      conv.participants.some((p) => p._id === selectedUser._id)
    );

    if (existingConversation) {
      setActiveConversation(existingConversation);
    } else {
      // Create a new conversation object (will be created when first message is sent)
      const newConversation = {
        _id: null,
        participants: [user, selectedUser],
      };
      setActiveConversation(newConversation);
    }
  };

  // Initialize socket and fetch conversations
  useEffect(() => {
    if (user) {
      initializeSocket(user._id);
      fetchConversations(token);
    }
  }, [user, token]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id, token);
    }
  }, [activeConversation]);

  // Handle message send
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    setLoading(true);
    const otherUser = activeConversation.participants.find(
      (p) => p._id !== user._id
    );

    try {
      await sendMessage(otherUser._id, messageText, token);
      setMessageText("");
      emitStopTyping(otherUser._id);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setMessageText(e.target.value);

    if (activeConversation) {
      const otherUser = activeConversation.participants.find(
        (p) => p._id !== user._id
      );

      emitTyping(otherUser._id, user.name);

      // Clear existing timeout
      if (typingTimeout) clearTimeout(typingTimeout);

      // Set new timeout to emit stop typing
      const timeout = setTimeout(() => {
        emitStopTyping(otherUser._id);
      }, 1000);

      setTypingTimeout(timeout);
    }
  };

  const otherUser = activeConversation?.participants.find(
    (p) => p._id !== user._id
  );

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-300 overflow-y-auto bg-gray-50">
        <div className="p-4 border-b border-gray-300 bg-white sticky top-0">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
        </div>
        <UserSearch onSelectUser={handleSelectUser} />
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              isActive={activeConversation?._id === conversation._id}
              onClick={() => setActiveConversation(conversation)}
            />
          ))
        )}
      </div>

      {/* Chat Area */}
      {activeConversation ? (
        <div className="w-2/3 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-300 bg-white flex items-center gap-3">
            <img
              src={otherUser?.profilePic}
              alt={otherUser?.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-800">{otherUser?.name}</h3>
              <p className="text-xs text-gray-500">{otherUser?.role}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-white">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Start a new conversation
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageItem
                    key={message._id}
                    message={message}
                    isOwn={message.sender._id === user._id}
                  />
                ))}
                {typingStatus && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <span>{typingStatus} is typing</span>
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></span>
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-300 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={handleTyping}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !messageText.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="w-2/3 flex items-center justify-center text-gray-500">
          <p>Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
}
