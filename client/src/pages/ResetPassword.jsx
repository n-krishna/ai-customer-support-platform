import axios from "axios";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
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

    setMessage("");
    setError("");

    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `http://localhost:5001/api/auth/reset-password/${token}`,
        {
          password: formData.password,
        }
      );

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reset password"
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
          <span className="text-2xl font-bold">SupportAI</span>
        </Link>

        <div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Reset your password securely.
          </h1>
          <p className="text-blue-100 text-lg max-w-xl">
            Create a new password and regain access to your SupportAI dashboard,
            tickets, and AI-powered support tools.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
            <p className="text-2xl font-bold">15m</p>
            <p className="text-sm text-blue-100">Token Expiry</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
            <p className="text-2xl font-bold">JWT</p>
            <p className="text-sm text-blue-100">Protected</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
            <p className="text-2xl font-bold">🔐</p>
            <p className="text-sm text-blue-100">Encrypted</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl p-8">
            <div className="mb-8">
              <Link to="/" className="flex items-center gap-3 mb-8">
                <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
                  AI
                </div>
                <span className="text-2xl font-bold">SupportAI</span>
              </Link>

              <p className="text-blue-400 font-semibold mb-2">
                Password recovery
              </p>

              <h2 className="text-3xl font-bold mb-2">
                Create new password
              </h2>

              <p className="text-slate-400">
                Enter and confirm your new password below.
              </p>
            </div>

            {message && (
              <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-xl mb-5">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-600/20"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <p className="text-center text-slate-400 mt-6">
              Remember your password?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;