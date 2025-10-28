import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PollIcon from '@mui/icons-material/Poll';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BarChartIcon from '@mui/icons-material/BarChart';
import petitionService from '../../services/petitionService';
import { pollService } from '../../services/pollService';
import { getCurrentUserId } from '../../utils/auth';

// Import the real OfficialActions component
import OfficialActions from './OfficialActions';

export default function DashboardCard() {
  const navigate = useNavigate();
  const userId = getCurrentUserId();

  const [loading, setLoading] = useState(true);
  const [pollsLoading, setPollsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 600 : false
  );

  const [allPetitions, setAllPetitions] = useState([]);
  const [pollStats, setPollStats] = useState({
    myPolls: 0,
    activePolls: 0,
    completedPolls: 0,
    totalPolls: 0
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch petitions
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        setLoading(true);
        const data = await petitionService.getAllPetitions();
        setAllPetitions(data.petitions || data);
      } catch (err) {
        console.error('Error fetching petitions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPetitions();
  }, []);

  // Fetch polls - FIXED CREATOR COMPARISON
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setPollsLoading(true);
        const data = await pollService.getPolls();
        const pollsArray = Array.isArray(data) ? data : data.polls || [];

        console.log('📊 Dashboard: Fetched polls:', pollsArray.length);
        console.log('👤 Current User ID:', userId);

        // Helper function to normalize ID comparison
        const normalizeId = (id) => {
          if (!id) return null;
          if (typeof id === 'string') return id;
          return id._id || id.id || id.toString();
        };

        // Count stats with improved creator matching
        const myPollsCount = pollsArray.filter(poll => {
          const creatorId = normalizeId(poll.creator);
          const matches = creatorId && String(creatorId) === String(userId);
          
          if (matches) {
            console.log('✅ Found my poll:', poll.question);
          }
          
          return matches;
        }).length;

        const activePollsCount = pollsArray.filter(
          poll => poll.status?.toLowerCase() === 'active'
        ).length;

        const completedPollsCount = pollsArray.filter(
          poll => ['closed', 'completed'].includes(poll.status?.toLowerCase())
        ).length;

        console.log('📈 Poll Stats:', {
          myPolls: myPollsCount,
          active: activePollsCount,
          completed: completedPollsCount,
          total: pollsArray.length
        });

        setPollStats({
          myPolls: myPollsCount,
          activePolls: activePollsCount,
          completedPolls: completedPollsCount,
          totalPolls: pollsArray.length
        });
      } catch (err) {
        console.error('❌ Error fetching polls:', err);
      } finally {
        setPollsLoading(false);
      }
    };

    if (userId) {
      fetchPolls();
    } else {
      console.warn('⚠️ No user ID found');
      setPollsLoading(false);
    }
  }, [userId]);

  // Petition counts
  const myPetitionsCount = allPetitions.filter(p => p.creator?._id === userId).length;
  const activePetitionsCount = allPetitions.filter(p => p.status === 'active').length;
  const successfulPetitionsCount = allPetitions.filter(
    p => ['closed', 'successful', 'under_review'].includes(p.status)
  ).length;

  return (
    <>
      {/* Petitions Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Petitions Overview</h3>
        <div className={isMobile ? 'flex flex-col gap-4' : 'flex flex-row gap-8'}>
          <div
            className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 cursor-pointer hover:shadow-xl transition-shadow"
            style={{ background: '#e3f2fd', color: '#111' }}
            onClick={() => navigate('/dashboard/petitions')}
          >
            <div className="flex justify-between mb-2">
              <span className="text-lg font-semibold">My Petitions</span>
              <EditIcon style={{ fontSize: 32 }} />
            </div>
            <span className="text-3xl font-bold mb-1">{loading ? '...' : myPetitionsCount}</span>
            <span className="text-sm opacity-60">created by you</span>
          </div>

          <div
            className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 cursor-pointer hover:shadow-xl transition-shadow"
            style={{ background: '#e8f5e8', color: '#111' }}
            onClick={() => navigate('/dashboard/petitions')}
          >
            <div className="flex justify-between mb-2">
              <span className="text-lg font-semibold">Active Petitions</span>
              <TrendingUpIcon style={{ fontSize: 32 }} />
            </div>
            <span className="text-3xl font-bold mb-1">{loading ? '...' : activePetitionsCount}</span>
            <span className="text-sm opacity-60">collecting signatures</span>
          </div>

          <div
            className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 cursor-pointer hover:shadow-xl transition-shadow"
            style={{ background: '#fff3e0', color: '#111' }}
          >
            <div className="flex justify-between mb-2">
              <span className="text-lg font-semibold">Closed</span>
              <CheckCircleIcon style={{ fontSize: 32 }} />
            </div>
            <span className="text-3xl font-bold mb-1">{loading ? '...' : successfulPetitionsCount}</span>
            <span className="text-sm opacity-60">closed or under review</span>
          </div>
        </div>
      </div>

      {/* Polls Overview */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Polls Overview</h3>
        <div className={isMobile ? 'flex flex-col gap-4' : 'flex flex-row gap-8'}>
          <div
            className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 cursor-pointer hover:shadow-xl transition-shadow"
            style={{ background: '#e8f5e8', color: '#111' }}
            onClick={() => navigate('/dashboard/polls')}
          >
            <div className="flex justify-between mb-2">
              <span className="text-lg font-semibold">My Polls</span>
              <PollIcon style={{ fontSize: 32 }} />
            </div>
            <span className="text-3xl font-bold mb-1">
              {pollsLoading ? (
                <div className="inline-flex items-center">
                  <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                pollStats.myPolls
              )}
            </span>
            <span className="text-sm opacity-60">created by you</span>
          </div>

          <div
            className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 cursor-pointer hover:shadow-xl transition-shadow"
            style={{ background: '#e0f2f1', color: '#111' }}
            onClick={() => navigate('/dashboard/polls')}
          >
            <div className="flex justify-between mb-2">
              <span className="text-lg font-semibold">Active Polls</span>
              <HowToVoteIcon style={{ fontSize: 32 }} />
            </div>
            <span className="text-3xl font-bold mb-1">
              {pollsLoading ? (
                <div className="inline-flex items-center">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                pollStats.activePolls
              )}
            </span>
            <span className="text-sm opacity-60">currently voting</span>
          </div>

          <div
            className="flex flex-col justify-center rounded-2xl shadow-lg flex-1 p-6 cursor-pointer hover:shadow-xl transition-shadow"
            style={{ background: '#f1f8e9', color: '#111' }}
          >
            <div className="flex justify-between mb-2">
              <span className="text-lg font-semibold">Completed Polls</span>
              <BarChartIcon style={{ fontSize: 32 }} />
            </div>
            <span className="text-3xl font-bold mb-1">
              {pollsLoading ? (
                <div className="inline-flex items-center">
                  <div className="w-6 h-6 border-2 border-lime-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                pollStats.completedPolls
              )}
            </span>
            <span className="text-sm opacity-60">finished voting</span>
          </div>
        </div>
      </div>

      {/* ➜  OFFICIAL ACTIONS  */}
      <OfficialActions />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Create Petition */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Start a Petition</h4>
              <p className="text-gray-600 text-sm">Gather support from your community</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/petitions/create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Create Petition
            </button>
          </div>
        </div>

        {/* Create Poll */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Create a Poll</h4>
              <p className="text-gray-600 text-sm">Get community opinions on important decisions</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/polls/create')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Create Poll
            </button>
          </div>
        </div>
      </div>

      {/* Community Engagement Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="text-center">
          <h4 className="font-bold text-gray-900 mb-3 text-xl">Make Your Voice Heard</h4>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of citizens making a difference in their communities. Whether it's through petitions or polls,
            every voice matters in building a better future together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard/petitions')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
            >
              Browse All Petitions
            </button>
            <button
              onClick={() => navigate('/dashboard/polls')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
            >
              Participate in Polls
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
