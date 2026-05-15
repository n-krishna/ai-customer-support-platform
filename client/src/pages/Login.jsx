import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/admin");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-950">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
            AI
          </div>

          <span className="text-2xl font-bold">
            SupportAI
          </span>
        </Link>

        <div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Smarter support starts with secure access.
          </h1>

          <p className="text-blue-100 text-lg max-w-xl">
            Manage AI conversations, customer tickets,
            and support analytics from one clean dashboard.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
            <p className="text-2xl font-bold">24/7</p>
            <p className="text-sm text-blue-100">
              Support
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
            <p className="text-2xl font-bold">AI</p>
            <p className="text-sm text-blue-100">
              Automation
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
            <p className="text-2xl font-bold">JWT</p>
            <p className="text-sm text-blue-100">
              Secured
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl p-8">
            <div className="mb-8">
              <Link
                to="/"
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
                  AI
                </div>

                <span className="text-2xl font-bold">
                  SupportAI
                </span>
              </Link>

              <p className="text-blue-400 font-semibold mb-2">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold mb-2">
                Login to your account
              </h2>

              <p className="text-slate-400">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-5">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                />
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

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-600/20"
              >
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
  );
}

export default Login;