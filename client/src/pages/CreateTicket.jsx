import axios from "axios";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Image,
    LogOut,
    Send,
    Ticket,
    X,
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001/api/chat";

function CreateTicket() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [formData, setFormData] = useState({
    subject: "",
    category: "Technical Issue",
    priority: "Medium",
    description: "",
  });

  const [ticketImage, setTicketImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  const displayName =
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    "Customer";

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    localStorage.clear();

    navigate("/login", {
      replace: true,
    });

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  /*
  |--------------------------------------------------------------------------
  | Input Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Image Upload
  |--------------------------------------------------------------------------
  */

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setTicketImage(file);

    setImagePreview(
      URL.createObjectURL(file)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Remove Image
  |--------------------------------------------------------------------------
  */

  const removeImage = () => {
    setTicketImage(null);
    setImagePreview("");
  };

  /*
  |--------------------------------------------------------------------------
  | Submit Ticket
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (
      !formData.subject.trim() ||
      !formData.description.trim()
    ) {
      setError(
        "Subject and description are required."
      );

      return;
    }

    try {
      setLoading(true);

      const fullDescription = `
Category: ${formData.category}

Priority: ${formData.priority}

Issue Description:
${formData.description}
      `;

      const submitData = new FormData();

      submitData.append(
        "subject",
        formData.subject
      );

      submitData.append(
        "description",
        fullDescription
      );

      if (ticketImage) {
        submitData.append(
          "image",
          ticketImage
        );
      }

      await axios.post(
        `${API_URL}/ticket`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setSuccess(
        "Your support ticket has been created successfully."
      );

      setFormData({
        subject: "",
        category: "Technical Issue",
        priority: "Medium",
        description: "",
      });

      setTicketImage(null);

      setImagePreview("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create ticket."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Protected Route
  |--------------------------------------------------------------------------
  */

  if (!token) {
    navigate("/login", {
      replace: true,
    });

    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}

        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >
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

        {/* Back */}

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Hero */}

        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-slate-900 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mb-5">
            <Ticket size={34} />
          </div>

          <p className="text-blue-100 font-semibold mb-2">
            Customer Support Ticket
          </p>

          <h1 className="text-4xl font-bold mb-3">
            Create a Support Ticket
          </h1>

          <p className="text-blue-100 max-w-2xl">
            Hi {displayName}, describe your issue
            clearly and attach screenshots if needed.
          </p>
        </div>

        {/* Form */}

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-xl">
          {/* Success */}

          {success && (
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-xl mb-6">
              <CheckCircle size={20} />

              {success}
            </div>
          )}

          {/* Error */}

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-6">
              <AlertCircle size={20} />

              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Subject */}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Subject
              </label>

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Example: Unable to reset my password"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
              />
            </div>

            {/* Category + Priority */}

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                >
                  <option>Technical Issue</option>

                  <option>Account Issue</option>

                  <option>Billing Issue</option>

                  <option>AI Chatbot Issue</option>

                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                >
                  <option>Low</option>

                  <option>Medium</option>

                  <option>High</option>

                  <option>Urgent</option>
                </select>
              </div>
            </div>

            {/* Description */}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={7}
                placeholder="Explain the issue, what you tried, and any error message you saw..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition resize-none"
              />
            </div>

            {/* Image Upload */}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Attach Screenshot (Optional)
              </label>

              <label className="flex items-center justify-center gap-3 w-full border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950 rounded-2xl px-6 py-10 cursor-pointer transition">
                <Image size={24} />

                <span className="text-slate-300">
                  Upload image or screenshot
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Preview */}

            {imagePreview && (
              <div className="relative w-fit">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-60 rounded-2xl border border-slate-700"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 w-8 h-8 rounded-full flex items-center justify-center transition"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-600/20"
            >
              <Send size={18} />

              {loading
                ? "Creating Ticket..."
                : "Create Ticket"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateTicket;