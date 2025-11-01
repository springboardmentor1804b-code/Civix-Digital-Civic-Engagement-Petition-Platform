import { useEffect, useState } from "react";
<<<<<<< HEAD
import { FaHome, FaFileAlt, FaClock, FaUserTie, FaChartBar, FaCog, FaQuestionCircle } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

export const SideBar = () => {
  const [curColor , setCurColor] = useState('dashboard');
  const colors = {
=======
import {
  FaHome,
  FaFileAlt,
  FaClock,
  FaUserTie,
  FaChartBar,
  FaCog,
  FaQuestionCircle,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { userInfo } from "../axios/user";

export const SideBar = () => {
  const location = useLocation();
  const [active, setActive] = useState({
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    dashboard: false,
    petitions: false,
    polls: false,
    officials: false,
    reports: false,
    settings: false,
    help: false,
<<<<<<< HEAD
  }
  const location = useLocation().pathname.split("\/");
  

  const whichColor = (location)=> {
    let cur = "dashboard"
    for(let color in colors) {
      if(location.includes(color)) cur = color;
    }
    setCurColor(cur);
  }

  useEffect(()=> {
    whichColor(location);
  },[]);

  const [active, setActive] = useState({ ...colors,  [curColor] : true});

  const handleClick = (name) => {
    setActive({ ...colors, [name]: true });
  }

  return (
    <div className="fixed min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white flex flex-col p-2 space-y-6 w-15 md:w-50 transition-all duration-300 pt-4 shadow-lg">

      <nav className="flex flex-col space-y-2">
        <Link
          to="/home/dashboard"
          className={`flex items-center space-x-3 p-2 rounded-lg font-medium transition-colors duration-200
      ${active.dashboard
              ? "bg-[#2563eb] text-white shadow-md"
              : "hover:bg-[#1e3a8a] hover:text-white text-gray-300"}`}
          onClick={() => handleClick("dashboard")}
        >
          <FaHome className="text-xl" />
          <span className="hidden md:inline">Dashboard</span>
        </Link>

        <Link
          to="/home/petitions"
          className={`flex items-center space-x-3 p-2 rounded-lg font-medium transition-colors duration-200
      ${active.petitions
              ? "bg-[#2563eb] text-white shadow-md"
              : "hover:bg-[#1e3a8a] hover:text-white text-gray-300"}`}
          onClick={() => handleClick("petitions")}
        >
          <FaFileAlt className="text-xl" />
          <span className="hidden md:inline">Petitions</span>
        </Link>

        <Link
          to="/home/polls"
          className={`flex items-center space-x-3 p-2 rounded-lg font-medium transition-colors duration-200
      ${active.polls
              ? "bg-[#2563eb] text-white shadow-md"
              : "hover:bg-[#1e3a8a] hover:text-white text-gray-300"}`}
          onClick={() => handleClick("polls")}
        >
          <FaClock className="text-xl" />
          <span className="hidden md:inline">Polls</span>
        </Link>

        <Link
          to="/home/officials"
          className={`flex items-center space-x-3 p-2 rounded-lg font-medium transition-colors duration-200
      ${active.officials
              ? "bg-[#2563eb] text-white shadow-md"
              : "hover:bg-[#1e3a8a] hover:text-white text-gray-300"}`}
          onClick={() => handleClick("officials")}
        >
          <FaUserTie className="text-xl" />
          <span className="hidden md:inline">Officials</span>
        </Link>

        <Link
          to="/home/reports"
          className={`flex items-center space-x-3 p-2 rounded-lg font-medium transition-colors duration-200
      ${active.reports
              ? "bg-[#2563eb] text-white shadow-md"
              : "hover:bg-[#1e3a8a] hover:text-white text-gray-300"}`}
          onClick={() => handleClick("reports")}
        >
          <FaChartBar className="text-xl" />
          <span className="hidden md:inline">Reports</span>
        </Link>

        <Link
          to="/home/settings"
          className={`flex items-center space-x-3 p-2 rounded-lg font-medium transition-colors duration-200
      ${active.settings
              ? "bg-[#2563eb] text-white shadow-md"
              : "hover:bg-[#1e3a8a] hover:text-white text-gray-300"}`}
          onClick={() => handleClick("settings")}
        >
          <FaCog className="text-xl" />
          <span className="hidden md:inline">Settings</span>
        </Link>



        <Link
          to="#"
          className={`flex items-center space-x-3 p-2 rounded-lg font-medium transition-colors duration-200
      ${active.help
              ? "bg-[#2563eb] text-white shadow-md"
              : "hover:bg-[#1e3a8a] hover:text-white text-gray-300"}`}
          onClick={() => handleClick("help")}
        >
          <FaQuestionCircle className="text-xl" />
          <span className="hidden md:inline">Help & Support</span>
        </Link>
      </nav>
    </div>

  );
};

=======
  });

  const updateActiveFromURL = (path) => {
    const current = {
      dashboard: path.includes("dashboard"),
      petitions: path.includes("petitions"),
      polls: path.includes("polls"),
      officials: path.includes("officials"),
      reports: path.includes("reports"),
      settings: path.includes("settings"),
      help: path.includes("help"),
    };
    const isAnyTrue = Object.values(current).some(Boolean);
    if (!isAnyTrue) current.dashboard = true;
    setActive(current);
  };

  useEffect(() => {
    updateActiveFromURL(location.pathname);
  }, [location]);

  const handleClick = (name) => {
    setActive({
      dashboard: false,
      petitions: false,
      polls: false,
      officials: false,
      reports: false,
      settings: false,
      help: false,
      [name]: true,
    });
  };

  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const getUser = async () => {
    const userData = await userInfo();
    if (!userData.found) {
      navigate("/login");
    } else {
      setData(userData.user);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="fixed min-h-screen flex flex-col space-y-6 pl-3 pt-1 w-18 md:w-48 transition-all duration-300 shadow-md bg-[#fdf3e7] border-r border-[#d6bfa6] text-[#3a2e28]">
      <nav className="flex flex-col space-y-2 items-center md:items-start w-full p-1">
        {[
          { to: "/home/dashboard", icon: FaHome, label: "Dashboard", key: "dashboard" },
          { to: "/home/petitions", icon: FaFileAlt, label: "Petitions", key: "petitions" },
          { to: "/home/polls", icon: FaClock, label: "Polls", key: "polls" },
          { to: "/home/officials", icon: FaUserTie, label: "Officials", key: "officials" },
          { to: "/home/reports", icon: FaChartBar, label: "Reports", key: "reports" },
          { to: "/home/settings", icon: FaCog, label: "Settings", key: "settings" },
          { to: "/home/help-support", icon: FaQuestionCircle, label: "Help & Support", key: "help" },
        ].map(
          (item) =>
            ((item.key === "officials" && data?.email.endsWith("@civix.gov.in")) ||
              item.key !== "officials") && (
              <Link
                key={item.key}
                to={item.to}
                className={`flex items-center space-x-3 p-2 rounded-lg w-full font-medium transition-all duration-200 ${
                  active[item.key]
                    ? "bg-[#8B5E3C] text-white shadow-md"
                    : "hover:bg-[#a18464] hover:text-white text-[#4a2c2a]"
                }`}
                onClick={() => handleClick(item.key)}
              >
                <item.icon
                  className={`text-xl transition ${
                    active[item.key] ? "text-white" : "text-[#8B5E3C]"
                  }`}
                />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            )
        )}
      </nav>
    </div>
  );
};
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
