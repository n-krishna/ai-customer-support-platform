import axios from "axios";
import {
  CheckCircle,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminRegister() {
  const navigate = useNavigate();

  const [step, setStep] = useState("register");
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    adminSecret: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setMessage("");
    setError("");

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.adminSecret
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5001/api/auth/admin-register",
        formData
      );

      setMessage(response.data.message || "Admin OTP sent to your email");
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Admin registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5001/api/auth/verify-otp",
        {
          email: formData.email,
          otp,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setMessage(
        response.data.message ||
          "Admin account verified successfully. Redirecting..."
      );

      setStep("success");

      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
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
            to="/admin-login"
            className="bg-slate-900 border border-slate-700 hover:border-blue-500 px-4 py-2 rounded-xl text-slate-300 hover:text-white transition"
          >
            Admin Login
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 rounded-3xl p-8 shadow-2xl">
            <div className="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center mb-6">
              {step === "success" ? (
                <CheckCircle size={42} />
              ) : (
                <ShieldCheck size={42} />
              )}
            </div>

            <p className="text-blue-100 font-semibold mb-2">
              {step === "register"
                ? "Admin Access"
                : step === "otp"
                ? "Email Verification"
                : "Verified Access"}
            </p>

            <h1 className="text-4xl font-bold mb-4">
              {step === "register"
                ? "Create admin account"
                : step === "otp"
                ? "Verify admin email"
                : "Admin verified"}
            </h1>

            <p className="text-blue-100 leading-relaxed">
              {step === "register"
                ? "Register securely as an administrator to manage customers, support tickets, and platform activity."
                : step === "otp"
                ? `Enter the OTP sent to ${formData.email}.`
                : "Your admin account has been verified successfully."}
            </p>
          </div>

          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl p-8 md:p-10">
            <p className="text-blue-400 font-semibold mb-2">
              {step === "register"
                ? "Admin Registration"
                : step === "otp"
                ? "OTP Verification"
                : "Registration Complete"}
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {step === "register"
                ? "Create your admin account"
                : step === "otp"
                ? "Enter verification code"
                : "Admin account verified"}
            </h2>

            <p className="text-slate-400 mb-8">
              {step === "register"
                ? "Enter your admin details and registration code."
                : step === "otp"
                ? `We sent a 6-digit OTP to ${formData.email}.`
                : "Redirecting to admin dashboard..."}
            </p>

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

            {step === "register" && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  {
                    name: "fullName",
                    type: "text",
                    placeholder: "Full name",
                    icon: User,
                  },
                  {
                    name: "email",
                    type: "email",
                    placeholder: "Admin email",
                    icon: Mail,
                  },
                  {
                    name: "password",
                    type: "password",
                    placeholder: "Password",
                    icon: Lock,
                  },
                  {
                    name: "adminSecret",
                    type: "password",
                    placeholder: "Admin registration code",
                    icon: KeyRound,
                  },
                ].map((field) => {
                  const Icon = field.icon;

                  return (
                    <div key={field.name} className="relative">
                      <Icon
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                      />
                    </div>
                  );
                })}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 py-3 rounded-xl font-semibold transition"
                >
                  {loading ? "Sending OTP..." : "Create Admin Account"}
                </button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="bg-slate-950 border border-slate-700 rounded-2xl p-5">
                  <h3 className="text-lg font-semibold mb-3">
                    Admin Email Verification
                  </h3>

                  <p className="text-slate-400 text-sm mb-4">
                    Enter the 6-digit OTP sent to{" "}
                    <span className="text-blue-400">{formData.email}</span>
                  </p>

                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 py-3 rounded-xl font-semibold transition"
                >
                  {loading ? "Verifying..." : "Verify Admin OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("register");
                    setOtp("");
                    setMessage("");
                    setError("");
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 rounded-xl font-semibold transition"
                >
                  Edit Admin Details
                </button>
              </form>
            )}

            {step === "success" && (
              <div className="bg-slate-950 border border-slate-700 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={42} />
                </div>

                <h3 className="text-2xl font-bold mb-3">
                  Verification Successful
                </h3>

                <p className="text-slate-400">
                  Your admin account has been created successfully.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;