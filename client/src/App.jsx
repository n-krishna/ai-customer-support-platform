import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Chatbot from "./pages/Chatbot";
import CustomerDashboard from "./pages/CustomerDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        {/* Protected Customer Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;