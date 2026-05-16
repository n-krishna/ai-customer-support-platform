import axios from "axios";
import {
  Calendar,
  CheckCircle,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState("register");
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dob: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setMessage("");
    setError("");

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.dob ||
      !formData.password
    ) {
      setError("Please fill in all required fields");
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
        "http://localhost:5001/api/auth/register",
        {
          fullName: formData.fullName,
          email: formData.email,
          dob: formData.dob,
          password: formData.password,
        }
      );

      setMessage(response.data.message);
      setStep("otp");
    } catch (err) {
      if (!err.response) {
        setError("Backend server is not running. Please start the server.");
      } else if (err.response.status === 409) {
        setError("Account already exists with this email");
      } else {
        setError(
          err.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!otp) {
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
          "Account verified successfully. Redirecting to your dashboard..."
      );

      setStep("success");

      setTimeout(() => {
        if (response.data.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid OTP. Please try again."
      );
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

            <span className="text-2xl font-bold">
              SupportAI
            </span>
          </Link>

          <Link
            to="/login"
            className="hidden sm:inline-flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-blue-500 px-4 py-2 rounded-xl text-slate-300 hover:text-white transition"
          >
            Login
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          <div className="lg:col-span-1">
            <div className="h-full bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 rounded-3xl p-8 shadow-2xl">
              <div className="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center mb-6">
                {step === "success" ? (
                  <CheckCircle size={42} />
                ) : (
                  <ShieldCheck size={42} />
                )}
              </div>

              <p className="text-blue-100 font-semibold mb-2">
                {step === "register"
                  ? "Secure Registration"
                  : step === "otp"
                  ? "Email Verification"
                  : "Account Verified"}
              </p>

              <h1 className="text-4xl font-bold mb-4">
                {step === "register"
                  ? "Create your account"
                  : step === "otp"
                  ? "Verify your email"
                  : "You are all set"}
              </h1>

              <p className="text-blue-100 leading-relaxed mb-8">
                {step === "register"
                  ? "Create your SupportAI account to start using AI-powered customer support tools."
                  : step === "otp"
                  ? `We sent a 6-digit verification code to ${formData.email}.`
                  : "Your account has been verified successfully. Redirecting you to your dashboard."}
              </p>

              <div className="space-y-4">
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <Mail size={22} />

                    <div>
                      <p className="font-semibold">
                        Email Verification
                      </p>

                      <p className="text-sm text-blue-100">
                        OTP secured account setup
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <Sparkles size={22} />

                    <div>
                      <p className="font-semibold">
                        AI Support Access
                      </p>

                      <p className="text-sm text-blue-100">
                        Chat, tickets, and profile tools
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
                  {step === "register"
                    ? "Get Started"
                    : step === "otp"
                    ? "Verification Required"
                    : "Registration Complete"}
                </p>

                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  {step === "register"
                    ? "Create your SupportAI account"
                    : step === "otp"
                    ? "Enter your OTP"
                    : "Account verified successfully"}
                </h2>

                <p className="text-slate-400">
                  {step === "register"
                    ? "Enter your details to set up your secure support account."
                    : step === "otp"
                    ? `Enter the code sent to ${formData.email}.`
                    : "Please wait while we take you to your dashboard."}
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

              {step === "register" && (
                <form onSubmit={handleSubmit} className="space-y-5">
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
                        name="fullName"
                        value={formData.fullName}
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

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Date of Birth
                    </label>

                    <div className="relative">
                      <Calendar
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Password
                      </label>

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
                          placeholder="Create password"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Confirm Password
                      </label>

                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm password"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-600/20"
                  >
                    <ShieldCheck size={18} />
                    {loading ? "Sending OTP..." : "Create Account"}
                  </button>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="bg-slate-950 border border-slate-700 rounded-2xl p-5">
                    <h3 className="text-lg font-semibold mb-3">
                      Email Verification
                    </h3>

                    <p className="text-slate-400 text-sm mb-4">
                      Enter the 6-digit OTP sent to{" "}
                      <span className="text-blue-400">
                        {formData.email}
                      </span>
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
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-600/20"
                  >
                    <CheckCircle size={18} />
                    {loading ? "Verifying..." : "Verify OTP"}
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
                    Edit Registration Details
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

                  <p className="text-slate-400 mb-6">
                    Your account has been created and verified successfully.
                  </p>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-green-500 rounded-full" />
                  </div>
                </div>
              )}

              <p className="text-center text-slate-400 mt-6">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;