import React from "react";
import { useAuth } from "../context/AuthContext";
import CitizenDashboard from "./CitizenDashboard"; // We will create this
import OfficialDashboard from "./OfficialDashboard"; // We will create this

const DashboardContent = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  if (!user) {
    return <div className="p-6 text-center">Please log in.</div>;
  }

  // Check the user's role and render the appropriate dashboard
  if (user.role === "Official" || user.role === "Public Official") {
    return <OfficialDashboard />;
  } else {
    return <CitizenDashboard />;
  }
};

export default DashboardContent;
