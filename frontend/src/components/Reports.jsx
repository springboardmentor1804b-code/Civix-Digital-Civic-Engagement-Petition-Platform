import React, { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, BarChart3, Activity, Download } from "lucide-react";
import api from "../Utils/api";
import { useAuth } from "../context/AuthContext";

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPetitions: 0,
    totalPolls: 0,
    petitionsByStatus: [],
    pollsByStatus: [],
    growth: null,
  });
  const [tab, setTab] = useState("community"); // 'community' | 'mine'
  const [myLoading, setMyLoading] = useState(false);
  const [myPetitionsByStatus, setMyPetitionsByStatus] = useState([]);
  const [myPollsByStatus, setMyPollsByStatus] = useState([]);
  const [communityPollsByStatus, setCommunityPollsByStatus] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/reports/stats");
        const overview = res?.data?.data?.overview;
        const charts = res?.data?.data?.charts;
        setStats({
          totalPetitions: overview?.totalPetitions ?? 0,
          totalPolls: overview?.totalPolls ?? 0,
          growth: overview?.growth || null,
          petitionsByStatus: Array.isArray(charts?.petitionsByStatus) ? charts.petitionsByStatus : [],
          pollsByStatus: Array.isArray(charts?.pollsByStatus) ? charts.pollsByStatus : [],
        });
      } catch (err) {
        // Keep existing UI with zeros on error
        setStats({ totalPetitions: 0, totalPolls: 0, growth: null, petitionsByStatus: [], pollsByStatus: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Auto-refresh every 30 seconds while tab is visible
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        fetchStats();
      }
    }, 10000);

    // Refresh when window/tab regains focus
    const onVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // Helper: compute Active/Closed for polls using 3-day expiry rule
  function computePollStatusFromList(polls) {
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const counts = { Active: 0, Closed: 0 };
    (polls || []).forEach((p) => {
      const isClosed = new Date() - new Date(p.createdAt) > threeDaysMs;
      if (isClosed) counts.Closed += 1; else counts.Active += 1;
    });
    return [
      { _id: "Active", count: counts.Active },
      { _id: "Closed", count: counts.Closed },
    ];
  }

  // Load all polls to derive community Active vs Closed
  useEffect(() => {
    let cancelled = false;
    const loadCommunityPolls = async () => {
      try {
        const res = await api.get("/polls");
        if (!cancelled) {
          setCommunityPollsByStatus(computePollStatusFromList(res.data || []));
        }
      } catch (_) {
        if (!cancelled) setCommunityPollsByStatus([]);
      }
    };
    loadCommunityPolls();
    const intervalId = setInterval(() => {
      if (!document.hidden) loadCommunityPolls();
    }, 10000);
    const onVisibilityChange = () => { if (!document.hidden) loadCommunityPolls(); };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => { clearInterval(intervalId); document.removeEventListener("visibilitychange", onVisibilityChange); cancelled = true; };
  }, []);

  const statusColorMap = useMemo(
    () => ({
      // refined colors to better match screenshot theme
      Active: "#2563EB", // blue
      "Under Review": "#F59E0B", // amber
      Closed: "#EF4444", // red
    }),
    []
  );

  const petitionData = useMemo(() => {
    const source = tab === "mine" ? myPetitionsByStatus : stats.petitionsByStatus;
    if (!source?.length) {
      return [
        { name: "Active", value: 0, color: statusColorMap["Active"] },
        { name: "Under Review", value: 0, color: statusColorMap["Under Review"] },
        { name: "Closed", value: 0, color: statusColorMap["Closed"] },
      ];
    }
    // Map backend format {_id: status, count} to recharts data
    const byStatus = {
      Active: 0,
      "Under Review": 0,
      Closed: 0,
    };
    source.forEach((s) => {
      const key = s?._id ?? "";
      const count = Number(s?.count ?? 0);
      if (key in byStatus) byStatus[key] = count;
    });
    return [
      { name: "Active", value: byStatus["Active"], color: statusColorMap["Active"] },
      { name: "Under Review", value: byStatus["Under Review"], color: statusColorMap["Under Review"] },
      { name: "Closed", value: byStatus["Closed"], color: statusColorMap["Closed"] },
    ];
  }, [tab, myPetitionsByStatus, stats.petitionsByStatus, statusColorMap]);

  const pollData = useMemo(() => {
    const source = tab === "mine" ? myPollsByStatus : communityPollsByStatus;
    const byStatus = { Active: 0, Closed: 0 };
    (source || []).forEach((s) => { if (s?._id in byStatus) byStatus[s._id] = Number(s.count || 0); });
    return [
      { name: "Active", value: byStatus.Active, color: statusColorMap["Active"] },
      { name: "Closed", value: byStatus.Closed, color: statusColorMap["Closed"] },
    ];
  }, [tab, myPollsByStatus, communityPollsByStatus, statusColorMap]);

  const activeEngagement = useMemo(() => {
    const srcPetitions = tab === "mine" ? myPetitionsByStatus : stats.petitionsByStatus;
    const srcPolls = tab === "mine" ? myPollsByStatus : stats.pollsByStatus;
    const petitionsActive = srcPetitions?.find?.((s) => s?._id === "Active")?.count ?? 0;
    const pollsActive = srcPolls?.find?.((s) => s?._id === "Active")?.count ?? 0;
    return Number(petitionsActive) + Number(pollsActive);
  }, [tab, myPetitionsByStatus, myPollsByStatus, stats.petitionsByStatus, stats.pollsByStatus]);

  const petitionsChangeText = useMemo(() => {
    const pct = stats.growth?.petitionsPct;
    if (typeof pct !== "number") return "";
    if (pct === 0) return "0% no change from last month";
    return `${pct > 0 ? "↑" : "↓"} ${Math.abs(pct)}% ${pct > 0 ? "increase" : "decrease"} from last month`;
  }, [stats.growth]);

  const pollsChangeText = useMemo(() => {
    const pct = stats.growth?.pollsPct;
    if (typeof pct !== "number") return "";
    if (pct === 0) return "0% no change from last month";
    return `${pct > 0 ? "↑" : "↓"} ${Math.abs(pct)}% ${pct > 0 ? "increase" : "decrease"} from last month`;
  }, [stats.growth]);

  // Load "My Activity" data on demand
  useEffect(() => {
    if (tab !== "mine" || !user) return;
    let cancelled = false;
    const loadMine = async () => {
      try {
        setMyLoading(true);
        const [petitionsRes, pollsRes] = await Promise.all([
          api.get("/petitions"),
          api.get("/polls"),
        ]);
        const myId = String(user.id || user._id || "");
        const myPetitions = (petitionsRes.data || []).filter((p) => String(p.owner?._id || "") === myId);
        const allPolls = pollsRes.data || [];
        const myPolls = allPolls.filter((p) => String(p.owner?._id || "") === myId);

        // Compute status counts for petitions
        const petitionStatusCounts = { Active: 0, "Under Review": 0, Closed: 0 };
        myPetitions.forEach((p) => {
          const key = ["Active", "Under Review", "Closed"].includes(p.status) ? p.status : "Active";
          petitionStatusCounts[key] = (petitionStatusCounts[key] || 0) + 1;
        });
        const petitionStatusArr = Object.entries(petitionStatusCounts).map(([k, v]) => ({ _id: k, count: v }));

        // Polls: compute Active/Closed using expiry rule
        const myPollsArr = computePollStatusFromList(myPolls);
        

        if (!cancelled) {
          setMyPetitionsByStatus(petitionStatusArr);
          setMyPollsByStatus(myPollsArr);
        }
      } catch (_) {
        if (!cancelled) {
          setMyPetitionsByStatus([]);
          setMyPollsByStatus([]);
        }
      } finally {
        if (!cancelled) setMyLoading(false);
      }
    };
    loadMine();
    return () => {
      cancelled = true;
    };
  }, [tab, user]);

  const StatCard = ({ title, value, icon: Icon, change, changeClass }) => (
    <div className="bg-white p-4 rounded-2xl shadow flex items-center justify-between w-full sm:w-1/3 border border-gray-100">
      <div>
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-[#2D3E50]">{value}</p>
        {change ? (
          <p className={`text-xs mt-1 ${changeClass || "text-gray-500"}`}>{change}</p>
        ) : null}
      </div>
      <div className="bg-[#E84C3D]/10 p-3 rounded-xl">
        <Icon className="text-[#E84C3D]" size={24} />
      </div>
    </div>
  );

  const ChartCard = ({ title, subtitle, data }) => (
    <div className="bg-white p-5 rounded-xl shadow w-full lg:w-[48%] border border-gray-100">
      <h3 className="text-[16px] font-semibold text-[#2D3E50]">{title}</h3>
      {subtitle ? (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      ) : null}
      <div className="h-64 mt-2">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }) =>
                percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center space-x-4 mt-2 text-sm">
        {data.map((item, i) => (
          <div key={i} className="flex items-center space-x-1">
            <span
              className="inline-block w-3 h-3 rounded-[3px]"
              style={{ backgroundColor: item.color }}
            ></span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#2D3E50]">Reports & Analytics</h2>
          <p className="text-gray-500 text-sm">
            Track civic engagement and measure the impact of petitions and polls.
          </p>
        </div>
        <button
          onClick={async () => {
            try {
              // Default to exporting petitions; adjust type as needed
              const res = await api.get("/reports/export", { params: { type: "petitions" }, responseType: "blob" });
              const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "reports.csv";
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (e) {
              // no-op; keep UI same if export fails
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#E84C3D] text-white text-sm rounded-lg hover:bg-[#c73d31] transition"
        >
          <Download size={18} />
          <span>Export Data</span>
        </button>

      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-4 mb-8">
        <StatCard
          title="Total Petitions"
          value={loading ? "-" : String(stats.totalPetitions)}
          icon={FileText}
          change={petitionsChangeText}
          changeClass={(() => {
            const pct = stats.growth?.petitionsPct;
            if (typeof pct !== "number" || pct === 0) return "text-gray-500";
            return pct > 0 ? "text-green-600" : "text-red-600";
          })()}
        />
        <StatCard
          title="Total Polls"
          value={loading ? "-" : String(stats.totalPolls)}
          icon={BarChart3}
          change={pollsChangeText}
          changeClass={(() => {
            const pct = stats.growth?.pollsPct;
            if (typeof pct !== "number" || pct === 0) return "text-gray-500";
            return pct > 0 ? "text-green-600" : "text-red-600";
          })()}
        />
        <StatCard
          title="Active Engagement"
          value={loading ? "-" : String(activeEngagement)}
          icon={Activity}
          change="Active petitions and polls"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab("community")}
          className={`pb-2 text-sm font-medium ${
            tab === "community"
              ? "text-[#E84C3D] border-b-2 border-[#E84C3D]"
              : "text-gray-500 hover:text-[#2D3E50]"
          }`}
        >
          Community Overview
        </button>
        <button
          onClick={() => setTab("mine")}
          className={`pb-2 text-sm font-medium ${
            tab === "mine"
              ? "text-[#E84C3D] border-b-2 border-[#E84C3D]"
              : "text-gray-500 hover:text-[#2D3E50]"
          }`}
        >
          My Activity
        </button>
      </div>

      {/* Charts */}
      <div className="flex flex-wrap justify-between gap-4">
        <ChartCard
          title="Petition Status Breakdown"
          subtitle="Distribution of petitions by current status"
          data={petitionData}
        />
        <ChartCard
          title="Poll Status Breakdown"
          subtitle="Distribution of polls by current status"
          data={pollData}
        />
      </div>
    </div>
  );
};

export default Reports;
