// components/UserManagement/login.jsx
import { useState } from "react";
import { useAuth } from "../helper/auth";
import api from "../baseurl/baseurl";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";

export default function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/affiliates/affiliateLogin", form);
      const data = res.data;

      const userData = data.user ?? data;
      const jwt = data.token ?? data.jwt ?? res.data?.token ?? null;

      login(userData, jwt);
      localStorage.setItem("affiliate", JSON.stringify(res.data.affiliate));
      toast.success("Login successful 🎉");
      
      navigate("/partner/statistics-dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Login failed ❌");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-200 px-4">
  <motion.div
    initial={{ y: 40, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md"
  >
    <motion.h2
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent"
    >
      Welcome Back 👋 <span className="block">MvM Tracking Panel</span>
    </motion.h2>

    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
        <input
          type="email"
          placeholder="Email"
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
        <input
          type="password"
          placeholder="Password"
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
      </div>

      {/* Button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        type="submit"
        className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
      >
        Login
      </motion.button>

    </form>
  </motion.div>
</div>

  );
}
