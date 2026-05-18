import axios from "axios";
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    LogOut,
    Plus,
    Ticket,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001/api/chat";

function MyTickets() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [tickets, setTickets] = useState([]);
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
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl">
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
            <div
              key={ticket.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl"
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyTickets;