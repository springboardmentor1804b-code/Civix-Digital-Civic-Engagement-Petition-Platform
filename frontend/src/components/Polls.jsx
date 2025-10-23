import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../Utils/api"; // 1. Import your central api client
import { Plus, MapPin, Edit, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Polls = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Active Polls");
  const tabs = ["Active Polls", "Polls I Voted On", "My Polls", "Closed Polls"];

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        // 2. Use 'api' and a relative path
        const res = await api.get("/polls");
        setPolls(res.data);
      } catch (err) {
        toast.error("Failed to fetch polls.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchPolls();
    }
  }, [authLoading]);

  const handleVote = async (pollId, optionId) => {
    try {
      // 3. Use 'api' for the vote request
      const res = await api.post(`/polls/${pollId}/vote`, { optionId });
      setPolls((prevPolls) =>
        prevPolls.map((p) => (p._id === pollId ? res.data : p))
      );
      toast.success("Your vote has been cast!");
      
      // Trigger dashboard refresh for engagement data
      window.dispatchEvent(new CustomEvent('contentCreated'));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cast vote.");
    }
  };

  const handleDelete = async (pollId) => {
    if (window.confirm("Are you sure you want to delete this poll?")) {
      try {
        // 4. Use 'api' for the delete request
        await api.delete(`/polls/${pollId}`);
        setPolls(polls.filter((p) => p._id !== pollId));
        toast.success("Poll deleted successfully.");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete poll.");
      }
    }
  };

  const filteredPolls = useMemo(() => {
    if (!user) return [];
    const userId = String(user.id || user._id || "");
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const isExpired = (p) => new Date() - new Date(p.createdAt) > threeDaysMs;
    switch (activeTab) {
      case "My Polls":
        return polls.filter((p) => String(p.owner?._id || "") === userId);
      case "Polls I Voted On":
        return polls.filter((p) => (p.votedBy || []).map((v) => String(v)).includes(userId));
      case "Closed Polls":
        return polls.filter((p) => isExpired(p));
      default:
        // Active Polls: not expired
        return polls.filter((p) => !isExpired(p));
    }
  }, [polls, activeTab, user]);

  if (authLoading || loading) {
    return <div className="p-6 text-center">Loading polls...</div>;
  }

  return (
    <div className="w-full px-6 lg:max-w-7xl lg:mx-auto lg:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2D3E50]">Polls</h1>
          <p className="text-gray-600">
            Participate in community polls and make your voice heard.
          </p>
        </div>
        <button
          onClick={() => navigate("/polls/create")}
          className="px-6 py-3 bg-[#E84C3D] text-white font-semibold rounded-lg hover:bg-red-600 transition flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create Poll
        </button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-[#E84C3D] text-white shadow"
                  : "bg-gray-100 text-[#2D3E50] hover:bg-[#E84C3D] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {filteredPolls.length > 0 ? (
          filteredPolls.map((poll) => {
            const totalVotes = poll.options.reduce(
              (sum, opt) => sum + opt.votes,
              0
            );
            const currentUserId = String(user?.id || user?._id || "");
            const hasVoted = user && (poll.votedBy || []).map((v) => String(v)).includes(currentUserId);
            const isOwner = user && String(poll.owner?._id || "") === currentUserId;
            const tenMinutes = 10 * 60 * 1000;
            const isEditable =
              new Date() - new Date(poll.createdAt) < tenMinutes;
            const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
            const isExpired = new Date() - new Date(poll.createdAt) > threeDaysMs;

            return (
              <div
                key={poll._id}
                className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:-translate-y-1 transform transition-all shadow-md hover:shadow-xl relative"
              >
                {isOwner && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    {isEditable && (
                      <Link
                        to={`/polls/${poll._id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition"
                        title="Edit Poll (available for 10 minutes)"
                      >
                        <Edit size={18} />
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(poll._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition"
                      title="Delete Poll"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mb-2">
                  {poll.location} • Created by {poll.owner.name}
                </p>
                <h3 className="text-xl font-semibold text-[#2D3E50] mb-4 pr-16">
                  {poll.question}
                </h3>

                <div className="space-y-3">
                  {poll.options.map((option) => {
                    const votePercentage =
                      totalVotes > 0
                        ? Math.round((option.votes / totalVotes) * 100)
                        : 0;
                    return (
                      <div key={option._id}>
                        {hasVoted || isExpired ? (
                          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                            <div className="flex justify-between items-center mb-2 text-sm font-medium text-[#2D3E50]">
                              <span>{option.text}</span>
                              <span className="text-[#E84C3D] font-semibold">{votePercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-[#E84C3D] h-3 rounded-full transition-all duration-500"
                                style={{ width: `${votePercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleVote(poll._id, option._id)}
                            className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-[#E84C3D] hover:bg-red-50 transition-all font-medium text-[#2D3E50]"
                          >
                            {option.text}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-[11px] text-gray-500 flex items-center justify-between">
                  <div className="flex items-center">
                    <span>
                      Created on {new Date(poll.createdAt).toLocaleDateString()}
                    </span>
                    {isExpired && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">Closed</span>
                    )}
                  </div>
                  <span className="ml-4">Total votes: {totalVotes}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No polls found with the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Polls;
