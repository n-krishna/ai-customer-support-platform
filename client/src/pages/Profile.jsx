import axios from "axios";
import {
    ArrowLeft,
    ChevronDown,
    LogOut,
    Mail,
    Save,
    User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const savedUser = JSON.parse(localStorage.getItem("user"));

  const [showDropdown, setShowDropdown] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  const [formData, setFormData] = useState({
    full_name:
      savedUser?.full_name ||
      savedUser?.fullName ||
      savedUser?.name ||
      "",
    email: savedUser?.email || "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  const displayName = formData.full_name.trim() || "Customer";

  const hasChanges = useMemo(() => {
    const oldName =
      savedUser?.full_name ||
      savedUser?.fullName ||
      savedUser?.name ||
      "";

    const oldEmail = savedUser?.email || "";

    return (
      formData.full_name.trim() !== oldName.trim() ||
      formData.email.trim() !== oldEmail.trim()
    );
  }, [formData, savedUser]);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    setMessage("");
    setError("");

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const name = formData.full_name.trim();
    const email = formData.email.trim();

    const oldName =
      savedUser?.full_name ||
      savedUser?.fullName ||
      savedUser?.name ||
      "";

    const oldEmail = savedUser?.email || "";

    if (!name || !email) {
      setError("Full name and email address are required.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!hasChanges) {
      setError("No changes detected.");
      return;
    }

    try {
      if (name !== oldName.trim()) {
        const nameResponse = await axios.post(
          "http://localhost:5001/api/auth/update-profile",
          {
            fullName: name,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        localStorage.setItem(
          "user",
          JSON.stringify(nameResponse.data.user)
        );
      }

      if (email !== oldEmail.trim()) {
        await axios.post(
          "http://localhost:5001/api/auth/send-email-change-otp",
          {
            newEmail: email,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPendingEmail(email);
        setOtpStep(true);
        setMessage("OTP sent to your new email address.");
        return;
      }

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update profile"
      );
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/verify-email-change-otp",
        {
          otp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setOtp("");
      setOtpStep(false);
      setPendingEmail("");
      setMessage("Email updated successfully.");

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid OTP. Please try again."
      );
    }
  };

  const handleLogout = () => {
    localStorage.clear();

    navigate("/login", { replace: true });

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-10">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
              AI
            </div>

            <span className="text-2xl font-bold">
              SupportAI
            </span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 bg-slate-900 border border-slate-700 hover:border-blue-500 px-4 py-2 rounded-xl transition"
            >
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-white">
                  {displayName}
                </p>

                <p className="text-xs text-slate-400">
                  Customer
                </p>
              </div>

              <ChevronDown size={16} className="text-slate-400" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-60 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="font-semibold text-white">
                    {displayName}
                  </p>

                  <p className="text-sm text-slate-400 break-all">
                    {formData.email}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 transition"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 rounded-3xl p-8 shadow-2xl">
              <div className="w-24 h-24 bg-white/15 rounded-full flex items-center justify-center mb-6">
                <User size={42} />
              </div>

              <p className="text-blue-100 font-semibold mb-2">
                Customer Profile
              </p>

              <h1 className="text-3xl font-bold mb-3">
                {displayName}
              </h1>

              <p className="text-blue-100 break-all">
                {formData.email}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  Account Information
                </h2>

                <p className="text-slate-400 mt-2">
                  Update your personal details used across your support account.
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

              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    />
                  </div>
                </div>

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

                {otpStep && (
                  <div className="bg-slate-950 border border-slate-700 rounded-2xl p-5">
                    <h3 className="text-lg font-semibold mb-3">
                      Verify New Email
                    </h3>

                    <p className="text-slate-400 text-sm mb-4">
                      Enter the OTP sent to{" "}
                      <span className="text-blue-400">
                        {pendingEmail}
                      </span>
                    </p>

                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition mb-4"
                    />

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-semibold transition"
                    >
                      Verify OTP
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={!hasChanges}
                    className="flex items-center justify-center gap-2 flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-600/20"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 rounded-xl font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;