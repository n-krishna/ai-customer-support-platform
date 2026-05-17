import axios from "axios";
import {
  ArrowLeft,
  Bot,
  Clock,
  LogOut,
  MessageCircle,
  Plus,
  Send,
  Ticket,
  User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Chatbot() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      message: "Hi! I’m your SupportAI assistant. How can I help you today?",
      created_at: new Date().toISOString(),
    },
  ]);

  const displayName =
    user?.full_name || user?.fullName || user?.name || "Customer";

  const authHeaders = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const fetchChats = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:5001/api/chat/chats",
        authHeaders
      );

      setChatHistory(response.data.chats || []);
    } catch (err) {
      console.log("Fetch chats error:", err.response?.data || err.message);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadChats = async () => {
      await fetchChats();
    };

    loadChats();
  }, [token, navigate, fetchChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const formatTime = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    return new Date(dateValue).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadChatMessages = async (chatId) => {
    try {
      setError("");
      setTicketMessage("");
      setActiveChatId(chatId);

      const response = await axios.get(
        `http://localhost:5001/api/chat/messages/${chatId}`,
        authHeaders
      );

      setMessages(response.data.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load chat messages");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || loading) {
      return;
    }

    const userMessageText = message.trim();

    const userMessage = {
      sender: "user",
      message: userMessageText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);
    setError("");
    setTicketMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5001/api/chat/message",
        {
          message: userMessageText,
          chatId: activeChatId,
        },
        authHeaders
      );

      if (!activeChatId) {
        setActiveChatId(response.data.chatId);
      }

      const botMessage = {
        sender: "bot",
        message: response.data.reply,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);

      await fetchChats();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          message: "Sorry, I could not process that request. Please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setError("");
    setTicketMessage("");
    setMessage("");

    setMessages([
      {
        sender: "bot",
        message: "New conversation started. How can I help you today?",
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const handleCreateTicket = async () => {
    try {
      setError("");
      setTicketMessage("");

      const lastUserMessage =
        [...messages].reverse().find((item) => item.sender === "user")
          ?.message || "Support request from chatbot";

      const response = await axios.post(
        "http://localhost:5001/api/chat/ticket",
        {
          subject: "Support request from chatbot",
          description: lastUserMessage,
        },
        authHeaders
      );

      setTicketMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
    }
  };

  const handleLogout = () => {
    localStorage.clear();

    navigate("/login", {
      replace: true,
    });

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
              AI
            </div>

            <span className="text-2xl font-bold">SupportAI</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-blue-500 px-4 py-2 rounded-xl text-slate-300 hover:text-white transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition mb-6"
            >
              <Plus size={18} />
              New Chat
            </button>

            <div className="space-y-3 mb-8">
              <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold">
                Support Menu
              </h3>

              <Link
                to="/chat"
                className="flex items-center gap-3 bg-blue-600/10 text-blue-400 border border-blue-500/30 rounded-xl px-4 py-3"
              >
                <MessageCircle size={18} />
                AI Chat
              </Link>

              <Link
                to="/tickets"
                className="flex items-center gap-3 hover:bg-slate-800 text-slate-300 rounded-xl px-4 py-3 transition"
              >
                <Ticket size={18} />
                My Tickets
              </Link>

              <Link
                to="/profile"
                className="flex items-center gap-3 hover:bg-slate-800 text-slate-300 rounded-xl px-4 py-3 transition"
              >
                <User size={18} />
                Profile
              </Link>
            </div>

            <div className="space-y-3 mb-8">
              <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold">
                Recent Chats
              </h3>

              {chatHistory.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No previous chats yet.
                </p>
              ) : (
                chatHistory.slice(0, 6).map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => loadChatMessages(chat.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition ${
                      activeChatId === chat.id
                        ? "bg-blue-600/10 text-blue-400 border border-blue-500/30"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={15} />

                      <span className="truncate text-sm">{chat.title}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <p className="text-sm text-slate-400 mb-1">Logged in as</p>

              <p className="font-semibold">{displayName}</p>

              <p className="text-sm text-slate-500 break-all">{user?.email}</p>
            </div>
          </div>

          <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-slate-900 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
                  <Bot size={26} />
                </div>

                <div>
                  <h1 className="text-xl font-bold">SupportAI Assistant</h1>

                  <p className="text-blue-100 text-sm">
                    Online · AI-powered customer support
                  </p>
                </div>
              </div>

              <button
                onClick={handleCreateTicket}
                className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl transition"
              >
                <Ticket size={16} />
                Create Ticket
              </button>
            </div>

            <div className="h-[560px] overflow-y-auto px-6 py-6 space-y-5 bg-slate-950/50">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {ticketMessage && (
                <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-xl">
                  {ticketMessage}
                </div>
              )}

              {messages.map((item, index) => (
                <div
                  key={`${item.sender}-${index}`}
                  className={`flex ${
                    item.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-lg ${
                      item.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-900 border border-slate-800 text-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {item.sender === "bot" ? (
                        <Bot size={16} className="text-blue-400" />
                      ) : (
                        <User size={16} />
                      )}

                      <span className="text-xs opacity-80">
                        {item.sender === "bot" ? "SupportAI" : displayName}
                      </span>

                      <span className="text-xs opacity-60">
                        {formatTime(item.created_at)}
                      </span>
                    </div>

                    <p className="leading-relaxed whitespace-pre-wrap">
                      {item.message}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Bot size={16} className="text-blue-400" />
                      <span>SupportAI is typing</span>
                      <span className="animate-pulse">...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-800 p-5 bg-slate-900">
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "I forgot my password",
                  "Create a ticket",
                  "Billing issue",
                  "Update profile",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setMessage(item)}
                    className="text-sm bg-slate-950 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3"
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 px-5 py-3 rounded-xl font-semibold transition flex items-center gap-2"
                >
                  <Send size={18} />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;