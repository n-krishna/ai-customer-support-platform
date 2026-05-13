import { BrowserRouter, Route, Routes } from "react-router-dom";

import AdminDashboard from "./pages/AdminDashboard";
import Chatbot from "./pages/Chatbot";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;