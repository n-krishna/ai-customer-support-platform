import axios from "axios";
import {
  Clock,
  LogOut,
  MessageCircle,
  Send,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001/api/chat";

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [dashboardData, setDashboardData] = useState({
    tickets: [],
    chats: [],
    stats: {
      totalTickets: 0,
      openTickets: 0,
      resolvedTickets: 0,
    },
  });

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState("");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchDashboard = async () => {
    const response = await axios.get(`${API_URL}/admin/dashboard`, authHeaders);

    setDashboardData({
      tickets: response.data.tickets || [],
      chats: response.data.chats || [],
      stats: {
        totalTickets: response.data.stats?.totalTickets || 0,
        openTickets: response.data.stats?.openTickets || 0,
        resolvedTickets: response.data.stats?.resolvedTickets || 0,
      },
    });
  };

  useEffect(() => {
    if (!token || user.role !== "admin") {
      navigate("/admin-login", { replace: true });
      return;
    }

    const loadDashboard = async () => {
      try {
        await fetchDashboard();
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load admin dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [token, user.role, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin-login", { replace: true });

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const getStatusStyle = (status) => {
    if (status === "Resolved") {
      return "bg-green-500/10 text-green-400 border-green-500";
    }

    if (status === "Pending") {
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500";
    }

    return "bg-blue-500/10 text-blue-400 border-blue-500";
  };

  const openTicketDetails = async (ticketId) => {
    try {
      setModalLoading(true);

      const response = await axios.get(
        `${API_URL}/admin/tickets/${ticketId}`,
        authHeaders
      );

      setSelectedTicket(response.data.ticket);
      setComments(response.data.comments || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load ticket details");
    } finally {
      setModalLoading(false);
    }
  };

  const updateTicketStatus = async (status) => {
    if (!selectedTicket) return;

    try {
      const response = await axios.patch(
        `${API_URL}/admin/tickets/${selectedTicket.id}/status`,
        { status },
        authHeaders
      );

      setSelectedTicket((prev) => ({
        ...prev,
        status: response.data.ticket.status,
      }));

      await fetchDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const addComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim() || !selectedTicket) return;

    try {
      const response = await axios.post(
        `${API_URL}/admin/tickets/${selectedTicket.id}/comment`,
        {
          comment: commentText,
        },
        authHeaders
      );

      setComments((prev) => [
        ...prev,
        {
          ...response.data.comment,
          admin_name: user.full_name || "Admin",
        },
      ]);

      setCommentText("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment");
    }
  };

  const statsCards = [
    {
      title: "Total Tickets",
      value: dashboardData.stats.totalTickets,
      icon: Ticket,
      description: "All submitted support tickets",
    },
    {
      title: "Open Tickets",
      value: dashboardData.stats.openTickets,
      icon: Clock,
      description: "Tickets waiting for action",
    },
    {
      title: "Resolved Tickets",
      value: dashboardData.stats.resolvedTickets,
      icon: ShieldCheck,
      description: "Completed support requests",
    },
    {
      title: "Recent Chats",
      value: dashboardData.chats.length,
      icon: MessageCircle,
      description: "Latest customer conversations",
    },
  ];

  if (!token || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
              AI
            </div>

            <span className="text-2xl font-bold">SupportAI Admin</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-blue-500 px-4 py-2 rounded-xl text-slate-300 hover:text-white transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-slate-900 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mb-5">
            <ShieldCheck size={34} />
          </div>

          <p className="text-blue-100 font-semibold mb-2">
            Admin Control Panel
          </p>

          <h1 className="text-4xl font-bold mb-3">
            Welcome back, {user.full_name || "Admin"}
          </h1>

          <p className="text-blue-100 max-w-2xl">
            Review customer tickets, add resolution comments, update ticket
            status, and monitor chatbot conversations.
          </p>
        </div>

        {loading && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-slate-400">
            Loading admin dashboard...
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
              {statsCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl"
                  >
                    <div className="w-12 h-12 bg-blue-600/15 text-blue-400 rounded-2xl flex items-center justify-center mb-5">
                      <Icon size={24} />
                    </div>

                    <p className="text-slate-400 text-sm mb-1">
                      {card.title}
                    </p>

                    <h2 className="text-4xl font-bold mb-2">{card.value}</h2>

                    <p className="text-slate-500 text-sm">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="grid xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Customer Tickets</h2>

                    <p className="text-slate-400 text-sm">
                      Click a ticket to review, comment, and update status
                    </p>
                  </div>

                  <Ticket className="text-blue-400" />
                </div>

                {dashboardData.tickets.length === 0 ? (
                  <p className="text-slate-500">No tickets available.</p>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => openTicketDetails(ticket.id)}
                        className="w-full text-left bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-2xl p-5 transition"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="text-sm text-slate-500">
                              Ticket #{ticket.id}
                            </p>

                            <h3 className="font-bold text-lg">
                              {ticket.subject}
                            </h3>
                          </div>

                          <span
                            className={`border px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                              ticket.status
                            )}`}
                          >
                            {ticket.status}
                          </span>
                        </div>

                        <p className="text-slate-400 text-sm whitespace-pre-wrap mb-4">
                          {ticket.description}
                        </p>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-slate-500 border-t border-slate-800 pt-3">
                          <span>
                            Customer: {ticket.full_name} · {ticket.email}
                          </span>

                          <span>{formatDate(ticket.created_at)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Recent Chats</h2>

                    <p className="text-slate-400 text-sm">
                      Latest customer AI conversations
                    </p>
                  </div>

                  <MessageCircle className="text-blue-400" />
                </div>

                {dashboardData.chats.length === 0 ? (
                  <p className="text-slate-500">No chats available.</p>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.chats.map((chat) => (
                      <div
                        key={chat.id}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-4"
                      >
                        <h3 className="font-semibold mb-1 truncate">
                          {chat.title}
                        </h3>

                        <p className="text-sm text-slate-500 mb-2">
                          {chat.full_name} · {chat.email}
                        </p>

                        <p className="text-xs text-slate-600">
                          {formatDate(chat.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between p-6 border-b border-slate-800">
              <div>
                <p className="text-sm text-slate-500">
                  Ticket #{selectedTicket.id}
                </p>

                <h2 className="text-2xl font-bold">
                  {selectedTicket.subject}
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  {selectedTicket.full_name} · {selectedTicket.email}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setComments([]);
                  setCommentText("");
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {modalLoading ? (
              <div className="p-6 text-slate-400">Loading ticket...</div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  {["Open", "Pending", "Resolved"].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateTicketStatus(status)}
                      className={`border px-4 py-2 rounded-xl text-sm font-semibold transition ${
                        selectedTicket.status === status
                          ? getStatusStyle(status)
                          : "border-slate-700 text-slate-400 hover:border-blue-500"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                  <h3 className="font-bold mb-3">Issue Details</h3>

                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {selectedTicket.description}
                  </p>

                  <p className="text-sm text-slate-500 border-t border-slate-800 pt-4 mt-4">
                    Created on {formatDate(selectedTicket.created_at)}
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                  <h3 className="font-bold mb-4">Admin Comments</h3>

                  {comments.length === 0 ? (
                    <p className="text-slate-500 mb-5">
                      No comments added yet.
                    </p>
                  ) : (
                    <div className="space-y-4 mb-5">
                      {comments.map((item) => (
                        <div
                          key={item.id}
                          className="border-l-4 border-blue-500 bg-slate-900 rounded-xl p-4"
                        >
                          <p className="text-slate-200 whitespace-pre-wrap">
                            {item.comment}
                          </p>

                          <p className="text-xs text-slate-500 mt-2">
                            {item.admin_name || "Admin"} ·{" "}
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={addComment} className="space-y-3">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={4}
                      placeholder="Add resolution notes or customer update..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition resize-none"
                    />

                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 px-5 py-3 rounded-xl font-semibold transition"
                    >
                      <Send size={18} />
                      Add Comment
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;