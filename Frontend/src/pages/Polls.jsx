import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPollsData, remove } from "../axios/poll";
import { userInfo } from "../axios/user";
import { Bounce, toast } from "react-toastify";
import { PollsCard } from "../components/PollsCard";

export const Polls = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [polls, setPolls] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);
  const [data, setData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activeTab, selectedLocation, polls, data]);

  const getUser = async () => {
    const userData = await userInfo();
    if (!userData?.found) {
      navigate("/login");
    } else {
      setData(userData.user);
      setIsAdmin(userData.user.email.endsWith("@civix.gov.in"));
      getPolls();
    }
  };

  const getPolls = async () => {
    const pollsData = await getPollsData();
    if (!pollsData.found) {
      toast.error(pollsData.message, {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
        transition: Bounce,
      });
      return;
    }
    setPolls(pollsData.data);
  };

  const handleDelete = async (cur) => {
    const response = await remove(cur._id);
    if (response.found) {
      toast.success(response.message, {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
        transition: Bounce,
      });
      getPolls();
    } else {
      toast.error(response.message, {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
        transition: Bounce,
      });
    }
  };

<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
  const applyFilters = () => {
    if (!data) return;

    let filtered = [...polls];

<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    if (selectedLocation !== "All") {
      filtered = filtered.filter((p) => p.location === selectedLocation);
    }

<<<<<<< HEAD

    switch (activeTab) {
      case "active":
        filtered = filtered.filter((p) => !p.isClosed); 
=======
    switch (activeTab) {
      case "active":
        filtered = filtered.filter((p) => !p.isClosed);
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
        break;
      case "voted":
        filtered = filtered.filter((p) =>
          p.options.some((opt) => opt.votes.includes(data._id))
        );
        break;
      case "mine":
        filtered = filtered.filter((p) => p.created_user_id === data._id);
        break;
      case "closed":
        filtered = filtered.filter((p) => p.isClosed);
        break;
      default:
        break;
    }

    setFilteredPolls(filtered);
  };

<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
  const clearFilters = () => {
    setActiveTab("active");
    setSelectedLocation("All");
  };

  const tabs = [
    { key: "active", label: "Active Polls" },
    { key: "voted", label: "Polls I Voted On" },
    { key: "mine", label: "My Polls" },
    { key: "closed", label: "Closed Polls" },
  ];

  return (
<<<<<<< HEAD
    <div className="flex flex-col w-full h-full text-white gap-3">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#2563eb] to-[#436df7] p-4 rounded-md shadow-lg text-white">
        <div className="flex flex-col">
          <h2 className="text-2xl md:text-3xl font-bold">Polls</h2>
          <p className="opacity-90">
=======
    <div className="flex flex-col w-full h-full gap-3 text-[#333333] p-2">


      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#A67C52] p-4 rounded-md shadow-lg text-white">
        <div className="flex flex-col">
          <h2 className="text-2xl md:text-3xl font-bold">Polls</h2>
          <p className="opacity-90 text-[#F5F5F5]">
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            Participate in community polls and make your voice heard.
          </p>
        </div>
        <Link
          to="/home/polls/form"
<<<<<<< HEAD
          className="px-4 py-2 md:text-lg rounded-md bg-[#067704] hover:bg-white hover:text-[#067704] transition font-semibold"
=======
          className="px-4 py-2 md:text-lg rounded-md bg-[#5A3E1B] hover:bg-white hover:text-[#5A3E1B] transition font-semibold"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
        >
          Create Poll
        </Link>
      </div>


      <div className="flex justify-between items-center flex-wrap gap-2">
<<<<<<< HEAD
=======


>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
<<<<<<< HEAD
              className={`px-4 py-2 rounded-md hover:bg-[#1e40af] text-white font-semibold transition cursor-pointer ${
                activeTab === tab.key ? "bg-[#000561]" : "bg-[#2563eb]"
              }`}
=======
              className={`px-4 py-2 rounded-md font-semibold transition cursor-pointer text-white ${
                activeTab === tab.key ? "bg-[#5A3E1B]" : "bg-[#A67C52]"
              } hover:bg-[#5A3E1B]`}
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            >
              {tab.label}
            </button>
          ))}
        </div>

<<<<<<< HEAD
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="p-2 rounded-md border border-[#2563eb] bg-[#0f172a] text-white outline-none cursor-pointer"
=======

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="p-2 rounded-md border border-[#5A3E1B] bg-[#A67C52] text-white outline-none cursor-pointer"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
        >
          <option value="All">All Locations</option>
          <option value="Telangana">Telangana</option>
          <option value="Andhra Pradesh">Andhra Pradesh</option>
          <option value="New Delhi">New Delhi</option>
          <option value="Kerala">Kerala</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
        </select>
      </div>


      {filteredPolls.length !== 0 ? (
        filteredPolls.map((curPoll, idx) => (
<<<<<<< HEAD
          <div key={idx}>
            <PollsCard
              poll={curPoll}
              currentUserId={data._id}
              getPolls={getPolls}
              data={data}
              handleDelete={handleDelete}
            />
          </div>
        ))
      ) : (

        <div className="flex flex-col items-center justify-center gap-3 p-6 bg-[#0f172a] rounded-md shadow-md border border-[#1e293b] text-center">
          <p className="text-gray-300 font-semibold text-lg">
=======
          <PollsCard
            key={idx}
            poll={curPoll}
            currentUserId={data._id}
            getPolls={getPolls}
            data={data}
            handleDelete={handleDelete}
            colorPrimary="#5A3E1B"
            colorAccent="#A67C52"
            colorText="#333333"
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 p-6 bg-[#A67C52] rounded-md shadow-md border border-[#5A3E1B] text-center">
          <p className="text-white font-semibold text-lg">
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            No Polls Found with the current filters
          </p>
          <button
            onClick={clearFilters}
<<<<<<< HEAD
            className="px-4 py-2 rounded-md bg-[#2563eb] hover:bg-[#1e40af] text-white font-semibold transition"
=======
            className="px-4 py-2 rounded-md bg-[#5A3E1B] hover:bg-[#A67C52] text-white font-semibold transition"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
