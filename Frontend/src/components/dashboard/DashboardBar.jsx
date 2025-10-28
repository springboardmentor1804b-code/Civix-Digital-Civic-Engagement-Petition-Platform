import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Tooltip } from "@mui/material";
import { isPublicOfficial } from "../../services/authService";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EditIcon from "@mui/icons-material/Edit";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ReportIcon from "@mui/icons-material/Report";
import HelpIcon from "@mui/icons-material/Help";
import AssessmentIcon from "@mui/icons-material/Assessment";

export default function DashboardBar() {
  const location = useLocation();
  const isOfficial = isPublicOfficial();

  // Base links for all users
  const baseLinks = [
    { to: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { to: "/dashboard/petitions", label: "Petitions", icon: <EditIcon /> },
    { to: "/dashboard/polls", label: "Polls", icon: <HowToVoteIcon /> },
    { to: "/dashboard/results", label: "Poll Results", icon: <AssessmentIcon /> },
  ];

  // Official-only links
  const officialLinks = [
    { to: "/dashboard/official", label: "Official Panel", icon: <BusinessIcon /> },
    { to: "/dashboard/analytics", label: "Analytics", icon: <AnalyticsIcon /> },
  ];

  // Common links for all users (Settings removed)
  const commonLinks = [
    { to: "/dashboard/reports", label: "Reports", icon: <ReportIcon /> },
    { to: "/dashboard/help", label: "Help & Support", icon: <HelpIcon /> },
  ];

  // Combine links based on user role
  const links = [
    ...baseLinks,
    ...(isOfficial ? officialLinks : []),
    ...commonLinks
  ];

  return (
    <nav className="w-full ">
      {links.map((link) => (
        <Tooltip 
          key={link.to}
          title={link.label} 
          placement="right"
          arrow
          enterDelay={500}
          leaveDelay={200}
        >
          <Link
            to={link.to}
            className={`flex items-center gap-3 px-6 py-3 mb-1 rounded-lg font-medium transition-colors
              ${
                location.pathname === link.to || 
                (link.to !== '/dashboard' && location.pathname.startsWith(link.to))
                  ? "bg-[#e3f2fd] text-[#10419C]"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
          >
            <span className="tooltip-icon">
              {link.icon}
            </span>
            <span className="link-label">
              {link.label}
            </span>
          </Link>
        </Tooltip>
      ))}
    </nav>
  );
}
