import axios from "axios";
import {
  ArrowLeft,
  Bot,
  Clock,
  Image,
  LogOut,
  MessageCircle,
  Mic,
  MicOff,
  Plus,
  Send,
  Ticket,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001/api/chat";
const DEFAULT_IMAGE_PROMPT =
  "Analyze this screenshot. Identify the issue, explain the cause, and provide step-by-step instructions to fix it.";

const createMessage = (sender, message, image = null) => ({
  sender,
  message,
  image,
  created_at: new Date().toISOString(),
});

function Chatbot() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    createMessage(
      "bot",
      "Hi! I’m your SupportAI assistant. How can I help you today?"
    ),
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const displayName =
    user?.full_name || user?.fullName || user?.name || "Customer";

  const authHeaders = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const resetAlerts = () => {
    setError("");
    setTicketMessage("");
  };

  const fetchChats = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/chats`, authHeaders);
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const formatTime = (dateValue) =>
    dateValue
      ? new Date(dateValue).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const resizeTextarea = (element) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const loadChatMessages = async (chatId) => {
    try {
      resetAlerts();
      setActiveChatId(chatId);

      const response = await axios.get(
        `${API_URL}/messages/${chatId}`,
        authHeaders
      );

      setMessages(response.data.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load chat messages");
    }
  };

  const updateActiveChat = async (chatId) => {
    if (!activeChatId) {
      setActiveChatId(chatId);
    }

    await fetchChats();
  };

  const sendImageMessage = async (userMessageText) => {
    const formData = new FormData();

    formData.append("image", selectedImage);
    formData.append("message", userMessageText || DEFAULT_IMAGE_PROMPT);
    formData.append("chatId", activeChatId || "");

    const response = await axios.post(`${API_URL}/image`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setMessages((prev) => [
      ...prev,
      createMessage("bot", response.data.reply),
    ]);

    clearSelectedImage();
    await updateActiveChat(response.data.chatId);
  };

  const sendTextMessage = async (userMessageText) => {
    const response = await axios.post(
      `${API_URL}/message`,
      {
        message: userMessageText,
        chatId: activeChatId,
      },
      authHeaders
    );

    setMessages((prev) => [
      ...prev,
      createMessage("bot", response.data.reply),
    ]);

    await updateActiveChat(response.data.chatId);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const userMessageText = message.trim();

    if ((!userMessageText && !selectedImage) || loading) return;

    setMessages((prev) => [
      ...prev,
      createMessage(
        "user",
        selectedImage ? userMessageText || DEFAULT_IMAGE_PROMPT : userMessageText,
        imagePreview || null
      ),
    ]);

    setMessage("");
    setLoading(true);
    resetAlerts();

    try {
      if (selectedImage) {
        await sendImageMessage(userMessageText);
      } else {
        await sendTextMessage(userMessageText);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");

      setMessages((prev) => [
        ...prev,
        createMessage(
          "bot",
          "Sorry, I could not process that request. Please try again."
        ),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser. Please use Chrome.");
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      resetAlerts();
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");

      setMessage(transcript);
    };

    recognition.onerror = (event) => {
      setError(`Voice input failed: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessage("");
    clearSelectedImage();
    resetAlerts();

    setMessages([
      createMessage("bot", "New conversation started. How can I help you today?"),
    ]);
  };

  const handleDeleteClick = (chatId) => {
    setChatToDelete(chatId);
    setShowDeleteModal(true);
  };

  const cancelDeleteChat = () => {
    setShowDeleteModal(false);
    setChatToDelete(null);
  };

  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;

    try {
      await axios.delete(`${API_URL}/delete/${chatToDelete}`, authHeaders);

      if (activeChatId === chatToDelete) {
        handleNewChat();
      }

      await fetchChats();
      cancelDeleteChat();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete chat");
    }
  };

  const handleCreateTicket = async () => {
    try {
      resetAlerts();

      const lastUserMessage =
        [...messages].reverse().find((item) => item.sender === "user")
          ?.message || "Support request from chatbot";

      const response = await axios.post(
        `${API_URL}/ticket`,
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
    navigate("/login", { replace: true });

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (!token) return null;

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
          <aside className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
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
                <p className="text-sm text-slate-500">No previous chats yet.</p>
              ) : (
                chatHistory.slice(0, 6).map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex items-center gap-2 rounded-xl transition ${
                      activeChatId === chat.id
                        ? "bg-blue-600/10 border border-blue-500/30"
                        : "hover:bg-slate-800"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => loadChatMessages(chat.id)}
                      className="min-w-0 flex-1 px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock size={15} className="shrink-0" />

                        <span
                          className={`block truncate text-sm ${
                            activeChatId === chat.id
                              ? "text-blue-400"
                              : "text-slate-300"
                          }`}
                        >
                          {chat.title}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(chat.id)}
                      className="shrink-0 mr-3 text-slate-500 hover:text-red-400 transition"
                      title="Delete chat"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <p className="text-sm text-slate-400 mb-1">Logged in as</p>
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm text-slate-500 break-all">{user?.email}</p>
            </div>
          </aside>

          <main className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
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

                    {item.image && (
                      <img
                        src={item.image}
                        alt="Uploaded"
                        className="mt-3 max-w-xs rounded-xl border border-slate-700"
                      />
                    )}
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

              {imagePreview && (
                <div className="relative w-32 mb-4">
                  <img
                    src={imagePreview}
                    alt="Selected preview"
                    className="w-32 h-24 object-cover rounded-xl border border-slate-700"
                  />

                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    resizeTextarea(e.target);
                  }}
                  placeholder={listening ? "Listening..." : "Type your message..."}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                    }
                  }}
                  className="flex-1 resize-none overflow-hidden min-h-[52px] max-h-[180px] bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[52px] px-4 rounded-xl border bg-slate-950 border-slate-700 text-slate-300 hover:border-blue-500 hover:text-white transition"
                  title="Upload image"
                >
                  <Image size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`h-[52px] px-4 rounded-xl border transition flex items-center justify-center ${
                    listening
                      ? "bg-red-600 border-red-500 text-white"
                      : "bg-slate-950 border-slate-700 text-slate-300 hover:border-blue-500 hover:text-white"
                  }`}
                  title="Voice input"
                >
                  {listening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 px-5 py-3 rounded-xl font-semibold transition flex items-center gap-2 h-[52px]"
                >
                  <Send size={18} />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-3">Delete Chat?</h2>

            <p className="text-slate-400 mb-6">
              Are you sure you want to permanently delete this chat?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={cancelDeleteChat}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteChat}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;