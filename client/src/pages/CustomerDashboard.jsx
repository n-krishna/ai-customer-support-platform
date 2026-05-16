import {
    CheckCircle,
    Clock,
    LogOut,
    MessageCircle,
    Ticket,
    User,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  const cards = [
    {
      title: "Start Chatbot Conversation",
      desc: "Ask questions and get instant AI support.",
      icon: <MessageCircle size={34} />,
      link: "/chat",
    },
    {
      title: "View Previous Chats",
      desc: "Review your past support conversations.",
      icon: <Clock size={34} />,
      link: "/chat-history",
    },
    {
      title: "Create Support Ticket",
      desc: "Submit an issue for the support team.",
      icon: <Ticket size={34} />,
      link: "/create-ticket",
    },
    {
      title: "Track Ticket Status",
      desc: "Check open, pending, and resolved tickets.",
      icon: <CheckCircle size={34} />,
      link: "/tickets",
    },
    {
      title: "View Admin Replies",
      desc: "See responses from the support team.",
      icon: <MessageCircle size={34} />,
      link: "/tickets",
    },
    {
      title: "Update Profile",
      desc: "Manage your name, email, and account details.",
      icon: <User size={34} />,
      link: "/profile",
    },
  ];

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-10">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
              AI
            </div>

            <span className="text-2xl font-bold">
              SupportAI
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-blue-500 px-4 py-2 rounded-xl text-slate-300 hover:text-white transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl mb-10">
          <p className="text-blue-100 font-semibold mb-2">
            Customer Dashboard
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome, {user?.full_name || user?.name || "Customer"}
          </h1>

          <p className="text-blue-100 max-w-2xl text-lg">
            Get instant AI help, create support tickets,
            track issue progress, and view replies from
            the support team.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="group bg-slate-900/80 border border-slate-800 hover:border-blue-500 rounded-3xl p-6 shadow-xl hover:shadow-blue-600/10 transition"
            >
              <div className="w-14 h-14 bg-blue-600/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white rounded-2xl flex items-center justify-center mb-5 transition">
                {card.icon}
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition">
                {card.title}
              </h3>

              <p className="text-slate-400 leading-relaxed">
                {card.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;