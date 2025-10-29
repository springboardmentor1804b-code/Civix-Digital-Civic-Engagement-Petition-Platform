import { useState, useEffect } from "react";
import { Doughnut, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useAuth } from "/src/context/AuthContext.jsx";

ChartJS.register(ArcElement, Tooltip, Legend);

const OFFICIALS_URL =
  (import.meta.env.VITE_BACKEND_URL || "http://localhost:5001") + "/api/officials";

// Card UI for metrics
const MetricCard = ({ title, value, iconClass, color }) => (
  <div
    className="bg-white rounded-xl shadow-md p-3 flex flex-col justify-between border-l-4"
    style={{ borderColor: color }}
  >
    <div className="flex justify-between items-center">
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <i className={`${iconClass} text-xl`} style={{ color }}></i>
    </div>
    <h2 className="text-2xl font-bold text-gray-800 mt-1">{value}</h2>
  </div>
);

function Officials() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch analytics for the logged-in official
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${OFFICIALS_URL}/analytics`, {
          headers: { "x-auth-token": token },
        });
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (loading)
    return (
      <div className="pt-20 text-center text-gray-600 text-lg">Loading...</div>
    );

  if (!analytics)
    return (
      <div className="pt-20 text-center text-gray-600 text-lg">
        No analytics data available.
      </div>
    );

  const { activity, petitions, polls } = analytics;

  // Define colors based on the Reports page
  const reportColors = {
    green: 'rgba(16, 185, 129, 0.7)', // Active/Open
    red: 'rgba(239, 68, 68, 0.7)',   // Closed
    orange: 'rgba(249, 115, 22, 0.7)', // Under Review (Petition specific)
  };
  const reportBorderColors = {
    green: 'rgba(16, 185, 129, 1)',
    red: 'rgba(239, 68, 68, 1)',
    orange: 'rgba(249, 115, 22, 1)',
  };


  return (
    <div className="pt-20 p-4 bg-gradient-to-b from-sky-200 to-gray-300 min-h-screen md:pl-54">
      <h1 className="text-3xl font-bold text-gray-800 font-inria mb-6">
        Official Dashboard
      </h1>

      {/* My Activity Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          My Activity Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Petitions Authored"
            value={activity.petitionsAuthored}
            iconClass="fa-solid fa-pen-to-square"
            color="#f97316"
          />
          <MetricCard
            title="Petitions Signed"
            value={activity.petitionsSigned}
            iconClass="fa-solid fa-signature"
            color="#65a30d"
          />
          <MetricCard
            title="Polls Created"
            value={activity.pollsCreated}
            iconClass="fa-solid fa-square-poll-horizontal"
            color="#06b6d4"
          />
          <MetricCard
            title="Polls Voted In"
            value={activity.pollsVotedIn}
            iconClass="fa-solid fa-check-to-slot"
            color="#c026d3"
          />
        </div>
      </div>

      {/* Petition & Poll Analytics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          My Petition & Poll Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Petition Analytics */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
              Petition Status
            </h3>
            <Doughnut
              data={{
                 // Maintain order: Active, Under Review, Closed if possible
                labels: Object.keys(petitions.status || {}),
                datasets: [
                  {
                    data: Object.values(petitions.status || {}),
                    backgroundColor: [
                        reportColors.green,   // Assuming order is Active, Under Review, Closed
                        reportColors.orange,
                        reportColors.red
                        ],
                    borderColor: [
                        reportBorderColors.green,
                        reportBorderColors.orange,
                        reportBorderColors.red
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
            />
            <p className="mt-3 text-sm text-gray-500 text-center">
              Total Petitions: {petitions.total}
              <br />
              Total Signatures: {petitions.totalSignatures}
            </p>
          </div>

          {/* Poll Analytics (Updated Colors) */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
              Poll Status
            </h3>
            <Pie
              data={{
                labels: ["Open", "Closed"], // Ensure this order matches the data mapping
                datasets: [
                  {
                    data: [
                      polls.status?.Open || 0, // Data for 'Open'
                      polls.status?.Closed || 0, // Data for 'Closed'
                    ],
                    backgroundColor: [
                        reportColors.green, // Color for 'Open'
                        reportColors.red    // Color for 'Closed'
                        ],
                    borderColor: [
                        reportBorderColors.green,
                        reportBorderColors.red
                    ],
                     borderWidth: 1,
                  },
                ],
              }}
            />
            <p className="mt-3 text-sm text-gray-500 text-center">
              Total Polls: {polls.total}
              <br />
              Total Votes: {polls.totalVotes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Officials;