import axios from "axios";
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

    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );

    setMessage(response.data.message);

    if (response.data.user.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
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
            Create your secure AI support workspace.
          </h1>

          <p className="text-blue-100 text-lg max-w-xl">
            Register your account, verify your email, and access your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
            <p className="text-2xl font-bold">OTP</p>
            <p className="text-sm text-blue-100">Email Verify</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
            <p className="text-2xl font-bold">JWT</p>
            <p className="text-sm text-blue-100">Secure Auth</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
            <p className="text-2xl font-bold">AI</p>
            <p className="text-sm text-blue-100">Support Flow</p>
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
                {step === "register" ? "Get started" : "Verify email"}
              </p>

              <h2 className="text-3xl font-bold mb-2">
                {step === "register" ? "Create your account" : "Enter OTP"}
              </h2>

              <p className="text-slate-400">
                {step === "register"
                  ? "Enter your details to set up your SupportAI account."
                  : `We sent a verification code to ${formData.email}.`}
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

            {step === "register" ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 py-3 rounded-xl font-semibold"
                >
                  {loading ? "Sending OTP..." : "Create Account"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 py-3 rounded-xl font-semibold"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            )}

            <p className="text-center text-slate-400 mt-6">
              Already have an account?{" "}
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

export default Register;