import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Utils/api"; // 1. Import your central api client
import AuthLayout from "./AuthLayout";
import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    role: "Citizen",
  });
  const navigate = useNavigate();

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
      const res = await api.post("/auth/register", formData);

      if (res.status === 201) {
        toast.success("Registration successful! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed.";
      toast.error(errorMessage);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-700 mb-1">
          Welcome to Civix
        </h2>
        <p className="text-gray-500 text-sm">
          Join our platform to make your voice heard.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full py-2 px-5 border border-gray-200 rounded-full text-sm bg-gray-50 focus:outline-none focus:border-red-500"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full py-2 px-5 border border-gray-200 rounded-full text-sm bg-gray-50 focus:outline-none focus:border-red-500"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full py-2 px-5 border border-gray-200 rounded-full text-sm bg-gray-50 focus:outline-none focus:border-red-500"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="text"
            name="location"
            placeholder="Location"
            className="w-full py-2 px-5 border border-gray-200 rounded-full text-sm bg-gray-50 focus:outline-none focus:border-red-500"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4 px-2">
          <label className="block text-gray-500 text-sm mb-1">
            I am registering as:
          </label>
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="radio"
                id="citizen"
                name="role"
                value="Citizen"
                checked={formData.role === "Citizen"}
                onChange={handleChange}
                className="mr-2 focus:ring-red-500 text-red-600"
              />
              <label htmlFor="citizen" className="text-sm text-gray-700">
                Citizen
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="publicOfficial"
                name="role"
                value="Public Official"
                checked={formData.role === "Public Official"}
                onChange={handleChange}
                className="mr-2 focus:ring-red-500 text-red-600"
              />
              <label htmlFor="publicOfficial" className="text-sm text-gray-700">
                Public Official
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-red-500 text-white rounded-full text-sm font-semibold my-2"
        >
          Create Account
        </button>

        <div className="text-center text-gray-500 text-sm mt-3">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-red-500 font-semibold hover:underline"
          >
            Log in
          </a>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
