import axios from "axios";
import { Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError("");

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        formData
      );

      const { token, user } = response.data;

      if (user.role !== "admin") {
        setError("Access denied. Admin account required.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/admin", { replace: true });
    } catch {
  setError("Invalid admin email or password");
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
              AI
            </div>

            <span className="text-2xl font-bold">SupportAI</span>
          </Link>

          <Link
            to="/admin-register"
            className="bg-slate-900 border border-slate-700 hover:border-blue-500 px-4 py-2 rounded-xl text-slate-300 hover:text-white transition"
          >
            Admin Register
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 rounded-3xl p-8 shadow-2xl">
            <div className="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck size={42} />
            </div>

            <p className="text-blue-100 font-semibold mb-2">
              Admin Portal
            </p>

            <h1 className="text-4xl font-bold mb-4">
              Secure admin login
            </h1>

            <p className="text-blue-100 leading-relaxed">
              Access the SupportAI admin dashboard to manage platform support
              operations.
            </p>
          </div>

          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl p-8 md:p-10">
            <p className="text-blue-400 font-semibold mb-2">
              Admin Login
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Login as administrator
            </h2>

            <p className="text-slate-400 mb-8">
              Only authorized admin accounts can access this area.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Admin email"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                />
              </div>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Admin password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 py-3 rounded-xl font-semibold transition"
              >
                <LogIn size={18} />
                {loading ? "Logging in..." : "Login as Admin"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;