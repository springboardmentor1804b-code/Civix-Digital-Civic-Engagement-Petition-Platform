import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import api from "../Utils/api";
import { useNavigate, Link } from "react-router-dom";

const Petitions = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [activeTag, setActiveTag] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        setLoading(true);
        let endpoint = "/petitions";

        // Conditional Fetching for Trending
        if (activeTag === "Trending") {
            endpoint = "/petitions/trending";
        }
        
        const res = await api.get(endpoint);
        setPetitions(res.data);
      } catch (err) {
        toast.error("Failed to fetch petitions.");
        setPetitions([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchPetitions();
    }
  }, [authLoading, activeTag]);

  const locations = useMemo(() => {
    if (!petitions) return ["All Locations"];
    const uniq = Array.from(new Set(petitions.map((p) => p.location)));
    return ["All Locations", ...uniq];
  }, [petitions]);

  const categories = useMemo(() => {
    if (!petitions) return ["All Categories"];
    const uniq = Array.from(new Set(petitions.map((p) => p.category)));
    return ["All Categories", ...uniq];
  }, [petitions]);

  const statuses = ["All", "Active", "Under Review", "Closed"];

  const filteredPetitions = useMemo(() => {
    if (!user || !petitions) return [];
    const currentUserId = String(user.id || user._id || "");
    
    return petitions.filter((p) => {
      // Location Filter
      if (
        selectedLocation !== "All Locations" &&
        p.location !== selectedLocation
      )
        return false;
      // Category Filter
      if (
        selectedCategory !== "All Categories" &&
        p.category !== selectedCategory
      )
        return false;
      // Status Filter
      if (selectedStatus !== "All" && p.status !== selectedStatus) return false;
      
      // Filtering logic based on Active Tag
      if (activeTag === "Trending") return true; 

      // My Petitions Filter
      if (
        activeTag === "My Petitions" &&
        String(p.owner?._id || "") !== currentUserId
      )
        return false;
      
      // Signed by Me Filter (UPDATED for new schema)
      if (
        activeTag === "Signed by Me" &&
        !(p.signatures || []).some(sig => String(sig.user || sig) === currentUserId)
      )
        return false;
      
      return true;
    });
  }, [
    petitions,
    selectedLocation,
    selectedCategory,
    selectedStatus,
    activeTag,
    user,
  ]);

  // Skip client-side sorting if "Trending" is active
  const sortedPetitions = useMemo(() => {
    if (activeTag === "Trending") {
      return filteredPetitions;
    }
    
    // Existing sorting logic for All/My/Signed tabs
    const rank = (status) => {
      if (status === "Active") return 0;
      if (status === "Under Review") return 1;
      if (status === "Closed") return 2;
      return 3;
    };
    const withDefault = Array.isArray(filteredPetitions)
      ? [...filteredPetitions]
      : [];
    return withDefault.sort((a, b) => {
      const statusDiff = rank(a?.status) - rank(b?.status);
      if (statusDiff !== 0) return statusDiff;
      const aVotes = Array.isArray(a?.signatures) ? a.signatures.length : 0;
      const bVotes = Array.isArray(b?.signatures) ? b.signatures.length : 0;
      return bVotes - aVotes;
    });
  }, [filteredPetitions, activeTag]);

  const handleSign = async (petitionId) => {
    try {
      const res = await api.post(`/petitions/${petitionId}/sign`);
      setPetitions((prev) =>
        prev.map((p) => (p._id === petitionId ? res.data : p))
      );
      toast.success("Petition signed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to sign petition.");
    }
  };

  function clearFilters() {
    setActiveTag("All");
    setSelectedLocation("All Locations");
    setSelectedCategory("All Categories");
    setSelectedStatus("All");
  }

  function circleProgressProps(percent, radius = 22) {
    const circumference = 2 * Math.PI * radius;
    const dashoffset =
      circumference * (1 - Math.max(0, Math.min(100, percent) / 100));
    return { circumference, dashoffset, radius };
  }

  if (authLoading || loading) {
    return <div className="p-6 text-center">Loading petitions...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2D3E50]">Petitions</h1>
          <p className="text-gray-600">
            Explore, support, and track petitions shaping your community.
          </p>
        </div>
        <button
          onClick={() => navigate("/petitions/create")}
          className="px-4 py-2 bg-[#E84C3D] text-white font-semibold rounded-lg hover:bg-red-600 transition"
        >
          Create New Petition
        </button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-3 mb-4">
          {/* ADDED "Trending" tab */}
          {["All", "Trending", "My Petitions", "Signed by Me"].map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTag === tag
                  ? "bg-[#E84C3D] text-white shadow"
                  : "bg-gray-100 text-[#2D3E50] hover:bg-[#E84C3D] hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm rounded-lg bg-gray-200 text-[#2D3E50] hover:bg-gray-300 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Showing{" "}
        <strong className="text-[#2D3E50]">{filteredPetitions.length}</strong>{" "}
        petition(s)
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedPetitions.length > 0 ? (
          sortedPetitions.map((petition) => {
            const percent = petition.goal
              ? Math.round((petition.signatures.length / petition.goal) * 100)
              : 0;
            const { circumference, dashoffset, radius } =
              circleProgressProps(percent);
            const currentUserId = String(user?.id || user?._id || "");
            
            // UPDATED HAS SIGNED CHECK
            const hasSigned =
              user && (petition.signatures || []).some(sig => String(sig.user || sig) === currentUserId);
              
            return (
              <article
                key={petition._id}
                className="relative bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl p-5 hover:-translate-y-2 transform transition-all shadow-md hover:shadow-2xl flex flex-col"
              >
                {/* Trending Badge */}
                {activeTag === "Trending" && (
                    <span className="absolute top-0 right-0 mt-3 mr-3 px-3 py-1 text-xs font-bold text-white bg-orange-500 rounded-full shadow-lg z-10">
                        🔥 TRENDING
                    </span>
                )}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-[#E84C3D] uppercase">
                    {petition.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(petition.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-[#2D3E50] mb-2 line-clamp-2">
                  {petition.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                  {petition.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        className="-rotate-90"
                      >
                        <circle
                          cx="24"
                          cy="24"
                          r={radius}
                          stroke="#e6e6e6"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r={radius}
                          stroke="#E84C3D"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-[#2D3E50]">
                        {petition.signatures.length}/{petition.goal}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Signatures</div>
                      <div className="text-sm font-medium text-[#2D3E50]">
                        {percent}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        petition.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {petition.status}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {petition.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 mt-auto">
                  <Link
                    to={`/petitions/${petition._id}`}
                    className="px-3 py-1 text-sm border border-[#2D3E50] text-[#2D3E50] rounded-lg hover:bg-[#2D3E50] hover:text-white transition w-full text-center"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleSign(petition._id)}
                    className={`px-3 py-1 text-sm text-white rounded-lg transition w-full ${
                      hasSigned || petition.status !== "Active"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#E84C3D] hover:opacity-90"
                    }`}
                    disabled={hasSigned || petition.status !== "Active"}
                  >
                    {hasSigned ? "Signed" : "Sign"}
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="col-span-full bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-600">
            No petitions found with the selected filters.
          </div>
        )}
      </div>
      </div>
  );
};

export default Petitions;