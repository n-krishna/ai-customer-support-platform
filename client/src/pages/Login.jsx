import axios from "axios";
import {
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setError("");

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        {
          email: formData.email.trim(),
          password: formData.password,
        }
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate(user.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 404) {
        setError("Invalid username or password");
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
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
            to="/register"
            className="hidden sm:inline-flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-blue-500 px-4 py-2 rounded-xl text-slate-300 hover:text-white transition"
          >
            Create Account
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          <div className="lg:col-span-1">
            <div className="h-full bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 rounded-3xl p-8 shadow-2xl">
              <div className="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck size={40} />
              </div>

              <p className="text-blue-100 font-semibold mb-2">
                Secure Access
              </p>

              <h1 className="text-4xl font-bold mb-4">Welcome back</h1>

              <p className="text-blue-100 leading-relaxed mb-8">
                Sign in to manage your AI support conversations, tickets,
                profile, and customer support activity.
              </p>

              <div className="space-y-4">
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <Sparkles size={22} />

                    <div>
                      <p className="font-semibold">AI Support</p>
                      <p className="text-sm text-blue-100">
                        Get instant answers anytime
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={22} />

                    <div>
                      <p className="font-semibold">Protected Login</p>
                      <p className="text-sm text-blue-100">
                        Secured with JWT authentication
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl p-8 md:p-10 h-full">
              <div className="mb-8">
                <p className="text-blue-400 font-semibold mb-2">
                  Account Login
                </p>

                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  Login to your account
                </h2>

                <p className="text-slate-400">
                  Enter your email and password to continue to your dashboard.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>

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
                      placeholder="you@example.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-400 hover:text-blue-300 transition"
                    >
                      Forgot password?
                    </Link>
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
                      placeholder="Enter your password"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-600/20"
                >
                  <LogIn size={18} />
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="text-center text-slate-400 mt-6">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;