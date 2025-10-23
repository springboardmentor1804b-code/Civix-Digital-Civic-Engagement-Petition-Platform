import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Utils/api"; // 1. Import your central api client
import { useAuth } from "../context/AuthContext";
import AuthLayout from "./AuthLayout";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 2. Use 'api' instead of 'axios' and a relative URL
      const res = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (res.data.user) {
        toast.success("Login successful!");
        login(res.data.user);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-700 mb-2">
          Welcome Back!
        </h2>
        <p className="text-gray-500 text-sm">Login to continue</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="email"
            name="email"
            className="w-full py-3 px-5 border border-gray-200 rounded-full text-sm transition-all duration-300 bg-gray-50 focus:outline-none focus:border-red-500 focus:bg-white"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            name="password"
            className="w-full py-3 px-5 border border-gray-200 rounded-full text-sm transition-all duration-300 bg-gray-50 focus:outline-none focus:border-red-500 focus:bg-white"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="text-right mb-5 w-full">
          <a
            href="#"
            className="text-red-500 text-sm font-medium hover:underline"
          >
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-red-500 text-white rounded-full text-sm font-semibold cursor-pointer transition-all duration-300 my-4 hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(231,76,60,0.3)]"
        >
          Login
        </button>

        <div className="text-center text-gray-500 text-sm mt-5">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="text-red-500 font-semibold hover:underline"
          >
            Register Now
          </a>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
