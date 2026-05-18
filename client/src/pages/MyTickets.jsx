import axios from "axios";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  LogOut,
  Plus,
  Send,
  Ticket,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001/api/chat";

function MyTickets() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const [status, setStatus] = useState({
    loading: true,
    error: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let isMounted = true;

    const fetchTickets = async () => {
      try {
        const response = await axios.get(`${API_URL}/tickets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (isMounted) {
          setTickets(response.data.tickets || []);
        }
      } catch (err) {
        if (isMounted) {
          setStatus({
            loading: false,
            error: err.response?.data?.message || "Failed to load tickets",
          });
        }

        return;
      }

      if (isMounted) {
        setStatus({
          loading: false,
          error: "",
        });
      }
    };

    fetchTickets();

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  const openTicketDetails = async (ticketId) => {
    try {
      setModalLoading(true);

      const response = await axios.get(`${API_URL}/tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSelectedTicket(response.data.ticket);
      setComments(response.data.comments || []);
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        error: err.response?.data?.message || "Failed to load ticket details",
      }));
    } finally {
      setModalLoading(false);
    }
  };

  const addCustomerReply = async (e) => {
    e.preventDefault();

    if (!replyText.trim() || !selectedTicket) return;

    try {
      const response = await axios.post(
        `${API_URL}/tickets/${selectedTicket.id}/comment`,
        {
          comment: replyText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments((prev) => [
        ...prev,
        {
          ...response.data.comment,
          sender_name: "You",
        },
      ]);

      setReplyText("");
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        error: err.response?.data?.message || "Failed to send reply",
      }));
    }
  };

  const closeTicketDetails = () => {
    setSelectedTicket(null);
    setComments([]);
    setReplyText("");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const getStatusStyle = (ticketStatus) => {
    if (ticketStatus === "Resolved") {
      return "bg-green-500/10 text-green-400 border-green-500";
    }

    if (ticketStatus === "Pending") {
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500";
    }

    return "bg-blue-500/10 text-blue-400 border-blue-500";
  };

  const getCommentSender = (item) => {
    if (item.sender_role === "customer") {
      return item.sender_name || "You";
    }

    return item.sender_name || item.admin_name || "Support Admin";
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
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

        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-slate-900 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mb-5">
            <Ticket size={34} />
          </div>

          <p className="text-blue-100 font-semibold mb-2">Support Tickets</p>

          <h1 className="text-4xl font-bold mb-3">My Tickets</h1>

          <p className="text-blue-100 max-w-2xl">
            View your submitted support tickets, track their status, and check
            updates from the support team.
          </p>
        </div>

        <div className="flex justify-end mb-6">
          <Link
            to="/create-ticket"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold transition"
          >
            <Plus size={18} />
            Create New Ticket
          </Link>
        </div>

        {status.loading && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-slate-400">
            Loading tickets...
          </div>
        )}

        {status.error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-5">
            {status.error}
          </div>
        )}

        {!status.loading && !status.error && tickets.length === 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-10 text-center">
            <Ticket size={44} className="mx-auto text-slate-500 mb-4" />

            <h2 className="text-2xl font-bold mb-2">No tickets created yet</h2>

            <p className="text-slate-400 mb-6">
              When you create a support ticket, it will appear here.
            </p>

            <Link
              to="/create-ticket"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold transition"
            >
              <Plus size={18} />
              Create Ticket
            </Link>
          </div>
        )}

        <div className="space-y-5">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => openTicketDetails(ticket.id)}
              className="w-full text-left bg-slate-900/80 border border-slate-800 hover:border-blue-500 rounded-3xl p-6 shadow-xl transition"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    Ticket #{ticket.id}
                  </p>

                  <h2 className="text-xl font-bold">{ticket.subject}</h2>
                </div>

                <span
                  className={`inline-flex items-center gap-2 border px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                    ticket.status
                  )}`}
                >
                  {ticket.status === "Resolved" ? (
                    <CheckCircle size={15} />
                  ) : (
                    <Clock size={15} />
                  )}

                  {ticket.status}
                </span>
              </div>

              <p className="text-slate-400 whitespace-pre-wrap leading-relaxed mb-5">
                {ticket.description}
              </p>

              <div className="border-t border-slate-800 pt-4 text-sm text-slate-500">
                Created on {formatDate(ticket.created_at)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between p-6 border-b border-slate-800">
              <div>
                <p className="text-sm text-slate-500">
                  Ticket #{selectedTicket.id}
                </p>

                <h2 className="text-2xl font-bold">
                  {selectedTicket.subject}
                </h2>

                <span
                  className={`inline-flex items-center gap-2 border px-3 py-1 rounded-full text-sm font-semibold mt-3 ${getStatusStyle(
                    selectedTicket.status
                  )}`}
                >
                  {selectedTicket.status === "Resolved" ? (
                    <CheckCircle size={15} />
                  ) : (
                    <Clock size={15} />
                  )}

                  {selectedTicket.status}
                </span>
              </div>

              <button
                type="button"
                onClick={closeTicketDetails}
                className="text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {modalLoading ? (
              <div className="p-6 text-slate-400">
                Loading ticket details...
              </div>
            ) : (
              <div className="p-6 space-y-6">
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
                  <h3 className="font-bold mb-4">Ticket Conversation</h3>

                  {comments.length === 0 ? (
                    <p className="text-slate-500 mb-5">
                      No replies yet. You can send a message to the support team
                      below.
                    </p>
                  ) : (
                    <div className="space-y-4 mb-5">
                      {comments.map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-xl p-4 border-l-4 ${
                            item.sender_role === "customer"
                              ? "bg-blue-600/10 border-blue-500"
                              : "bg-slate-900 border-green-500"
                          }`}
                        >
                          <p className="text-slate-200 whitespace-pre-wrap">
                            {item.comment}
                          </p>

                          <p className="text-xs text-slate-500 mt-2">
                            {getCommentSender(item)} ·{" "}
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={addCustomerReply} className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                      placeholder="Reply to support team..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition resize-none"
                    />

                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 px-5 py-3 rounded-xl font-semibold transition"
                    >
                      <Send size={18} />
                      Send Reply
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

export default MyTickets;