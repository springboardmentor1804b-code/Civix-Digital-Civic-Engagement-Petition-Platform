import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '/src/context/AuthContext.jsx';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API_URL = 'http://localhost:5001/api/reports';

// Custom Hook for fetching report data
const useReportData = () => {
    const { token } = useAuth();
    const [communityData, setCommunityData] = useState(null);
    const [myActivityData, setMyActivityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch both community and user activity reports
    const fetchData = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Fetch Community Data
            const communityResponse = await fetch(`${API_URL}/community`, {
                headers: { 'x-auth-token': token }
            });
            const communityJson = await communityResponse.json();
            if (communityResponse.ok) {
                setCommunityData(communityJson);
            } else {
                throw new Error(communityJson.msg || 'Failed to fetch community report.');
            }

            // Fetch My Activity Data
            const myActivityResponse = await fetch(`${API_URL}/my-activity`, {
                headers: { 'x-auth-token': token }
            });
            const myActivityJson = await myActivityResponse.json();
            if (myActivityResponse.ok) {
                setMyActivityData(myActivityJson);
            } else {
                throw new Error(myActivityJson.msg || 'Failed to fetch my activity report.');
            }

        } catch (err) {
            console.error("Report Fetch Error:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { communityData, myActivityData, loading, error, refreshData: fetchData };
};

// Component to render a simple analytic card (used for metrics)
const MetricCard = ({ title, value, iconClass, color }) => (
    <div className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between border-l-4" style={{ borderColor: color }}>
        <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <i className={`${iconClass} text-2xl`} style={{ color: color }}></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mt-2">{value}</h2>
    </div>
);


function Reports() {
    const { communityData, myActivityData, loading, error, refreshData } = useReportData();
    const [activeTab, setActiveTab] = useState('community');

    if (loading) {
        return <div className="pt-20 p-4 min-h-screen bg-gradient-to-b from-sky-200 to-gray-300 md:pl-54 text-center text-gray-700 font-bold">Loading Reports...</div>;
    }

    if (error) {
        return <div className="pt-20 p-4 min-h-screen bg-gradient-to-b from-sky-200 to-gray-300 md:pl-54 text-center text-red-600 font-bold">Error loading reports: {error}</div>;
    }

    const comm = communityData?.communityOverview;
    const petitionAnl = communityData?.petitionAnalytics;
    const pollAnl = communityData?.pollAnalytics;

    const petitionStatusData = {
        labels: Object.keys(petitionAnl?.status || {}),
        datasets: [
            {
                label: 'Status',
                data: Object.values(petitionAnl?.status || {}),
                backgroundColor: [
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(249, 115, 22, 0.7)',
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(249, 115, 22, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const petitionCategoryData = {
        labels: Object.keys(petitionAnl?.category || {}),
        datasets: [
            {
                label: 'Category',
                data: Object.values(petitionAnl?.category || {}),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(249, 115, 22, 0.7)',
                    'rgba(217, 70, 239, 0.7)',
                    'rgba(22, 163, 74, 0.7)',
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(217, 70, 239, 1)',
                    'rgba(22, 163, 74, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const pollStatusData = {
        labels: Object.keys(pollAnl?.status || {}),
        datasets: [
            {
                label: 'Poll Status',
                data: Object.values(pollAnl?.status || {}),
                backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(239, 68, 68, 0.7)'],
                borderColor: ['rgba(16, 185, 129, 1)', 'rgba(239, 68, 68, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const pollLocationData = {
        labels: Object.keys(pollAnl?.locations || {}),
        datasets: [
            {
                label: 'Polls by Location',
                data: Object.values(pollAnl?.locations || {}),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(249, 115, 22, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(217, 70, 239, 0.7)',
                    'rgba(22, 163, 74, 0.7)',
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(217, 70, 239, 1)',
                    'rgba(22, 163, 74, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="pt-20 p-4 bg-gradient-to-b from-sky-200 to-gray-300 min-h-screen md:pl-54">
            <div className='pl-6 pt-6'>
                <h1 className="text-3xl font-bold text-gray-800 font-inria">Reports & Analytics</h1>
                <p className="text-gray-700 mt-1 font-bold">Track civic engagement and measure the impact of petitions and polls.</p>
            </div>

            {/* Main Content Container */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">

                {/* Tabs for Community vs My Activity */}
                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-auto mb-6">
                    <button
                        onClick={() => setActiveTab('community')}
                        className={`cursor-pointer py-2 px-4 rounded-md font-semibold text-sm flex-1 text-center ${activeTab === 'community' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-black'}`}>
                        Community Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`cursor-pointer py-2 px-4 rounded-md font-semibold text-sm flex-1 text-center ${activeTab === 'my' ? 'bg-white shadow text-orange-600' : 'text-gray-600 hover:text-black'}`}>
                        My Activity
                    </button>
                </div>

                {/* Content for Community Overview */}
                {activeTab === 'community' && comm && (
                    <div className='space-y-6'>
                        {/* Petition Analytics */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-700 mb-4">Petition Analytics</h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className="bg-white p-5 rounded-xl shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Petition Status</h3>
                                    <Doughnut data={petitionStatusData} />
                                </div>
                                <div className="bg-white p-5 rounded-xl shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Petition Categories</h3>
                                    <Pie data={petitionCategoryData} />
                                </div>
                            </div>
                        </div>

                        {/* Poll Analytics */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-700 mb-4">Poll Analytics</h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className="bg-white p-5 rounded-xl shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Poll Status</h3>
                                    <Doughnut data={pollStatusData} />
                                </div>
                                <div className="bg-white p-5 rounded-xl shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Polls by Location</h3>
                                    <Pie data={pollLocationData} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content for My Activity */}
                {activeTab === 'my' && myActivityData && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                        <MetricCard
                            title="Petitions Authored"
                            value={myActivityData.petitionsAuthored}
                            iconClass="fa-solid fa-pen-to-square"
                            color="#f97316"
                        />
                        <MetricCard
                            title="Petitions Signed"
                            value={myActivityData.petitionsSigned}
                            iconClass="fa-solid fa-signature"
                            color="#65a30d"
                        />
                        <MetricCard
                            title="Polls Created"
                            value={myActivityData.pollsCreated}
                            iconClass="fa-solid fa-square-poll-horizontal"
                            color="#06b6d4"
                        />
                        <MetricCard
                            title="Polls Voted In"
                            value={myActivityData.pollsVotedIn}
                            iconClass="fa-solid fa-check-to-slot"
                            color="#c026d3"
                        />
                    </div>
                )}

                {/* Refresh Button */}
                <button
                    onClick={refreshData}
                    className='mt-6 bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 text-sm transition duration-200'
                >
                    <i className="fa-solid fa-rotate-right mr-2"></i> Refresh Data
                </button>

            </div>
        </div>
    );
}

export default Reports;