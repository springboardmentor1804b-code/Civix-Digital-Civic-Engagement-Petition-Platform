import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  FileText,
  BarChart2,
  Users,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out successfully.");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  const navLinks = [
    { to: "/dashboard", icon: Home, text: "Dashboard" },
    { to: "/petitions", icon: FileText, text: "Petitions" },
    { to: "/polls", icon: BarChart2, text: "Polls" },
    // { to: "/officials", icon: Users, text: "Officials" },
    { to: "/reports", icon: BarChart2, text: "Reports" },
    { to: "/settings", icon: Settings, text: "Settings" },
  ];

  return (
    <div className="flex h-screen bg-white lg:bg-gray-100">
      {/* Sidebar - Fixed */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#2D3E50] text-white shadow-md transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 flex flex-col`}
      >
        <div className="p-6 text-xl font-bold flex justify-between items-center">
          Civix <span className="text-gray-400 text-sm">Beta</span>
        </div>

        <nav className="mt-6 space-y-2">
          {/* 2. Replaced static <a> tags with dynamic <Link> components */}
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)} // Close sidebar on mobile click
              className={`flex items-center px-6 py-2 transition-colors duration-200 ${
                location.pathname === link.to
                  ? "bg-[#E84C3D] text-white rounded-r-full"
                  : "text-gray-300 hover:bg-[#E84C3D] hover:text-white"
              }`}
            >
              <link.icon className="w-5 h-5 mr-3" /> {link.text}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="border-t border-gray-600">
            <Link
              to="/help"
              className="flex items-center px-6 py-3 hover:bg-[#E84C3D] hover:text-white text-gray-300"
            >
              <HelpCircle className="w-5 h-5 mr-3" /> Help & Support
            </Link>
          </div>
          <div className="border-t border-gray-600 p-4">
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area - Scrollable */}
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header - Only visible on mobile */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <span className="font-medium">{user.name}</span>
            <div className="w-8 h-8 bg-[#2D3E50] text-white flex items-center justify-center rounded-full font-bold">
              {user.name[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto bg-white lg:bg-gray-100">
          <div className="p-6">
            {/* 3. Outlet will render the correct page (DashboardContent, Petitions, etc.) */}
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
