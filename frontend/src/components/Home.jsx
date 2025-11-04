import { useAuth } from '../context/AuthContext'; // 1. Import the useAuth hook
import { useState, useEffect } from 'react';
import PetitionComponent from './petitions/PetitionComponent';
import PollCard from './polls/PollCard.jsx'; // IMPORT PollCard

function Home() {
    const { user, token } = useAuth(); // 2. Get the user object from the context
    const categories = ['All Categories', 'Environment', 'Infrastructure', 'Education', 'Public Safety', 'Transportation', 'Healthcare', 'Housing'];
    const cities = [
        'All locations',
        'Mumbai, MH',
        'Delhi, DL',
        'Bengaluru, KA',
        'Chennai, TN',
        'Kolkata, WB',
        'Hyderabad, TS',
        'Pune, MH'
    ];
    const [selectedCategoriy, setSelectedCategoriy] = useState('All Categories');
    const [selectedCity, setSelectedCity] = useState(cities[0] || "");
    const [loading, setLoading] = useState(true);
    
    const [petitions, setPetitions] = useState([]);
    const [polls, setPolls] = useState([]); // ADDED: State for all polls
    
    const [userPoll, setUserPoll] = useState(null);
    const [myPetitions, setMyPetitions] = useState(0);
    const [SuccessfulPetitions, setSuccessfulPetitions] = useState(0);
    
    const [filteredActivePetitions, setFilteredActivePetitions] = useState([]); // RENAMED
    const [filteredActivePolls, setFilteredActivePolls] = useState([]); // ADDED: State for filtered polls

    function clearFilter() {
        setSelectedCategoriy('All Categories');
        setSelectedCity(cities[0] || "");
    }

    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

    // Fetch Petitions
    useEffect(() => {
        const fetchPetitions = async () => {
            try {
                const response = await fetch(`${API_URL}/api/petitions`);
                const data = await response.json();
                if (response.ok) setPetitions(data);
                else throw new Error('Failed to fetch petitions');
            } catch (error) {
                console.error("Fetch petitions error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPetitions();
    }, [API_URL]);

    // Fetch Polls
    useEffect(() => {
        const fetchPolls = async () => {
            if (!token) return;
            try {
                const response = await fetch(`${API_URL}/api/polls`, {
                    headers: { 'x-auth-token': token }
                });
                const data = await response.json();
                if (response.ok) setPolls(data);
                else throw new Error('Failed to fetch polls');
            } catch (error) {
                console.error("Fetch polls error:", error);
            }
        };
        fetchPolls();
    }, [token, API_URL]);


    // Fetch User's Poll Count
    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/user/polls`, {
                    headers: { 'x-auth-token': token },
                });
                const data = await response.json();
                if (response.ok) setUserPoll(data);
                else throw new Error('Failed to fetch petitions');
            } catch (error) {
                console.error("Fetch petitions error:", error);
            }
        };
        if (token) fetchPoll();
    },[token,API_URL]);

    // Calculate user's petition stats
    useEffect(() => {
        if (user) {
            const count = petitions.filter(p => p.author._id === user._id).length;
            const successCount = petitions.filter(p => p.author._id === user._id && (p.status === "Closed" || p.status === "Under Review")).length;
            setMyPetitions(count);
            setSuccessfulPetitions(successCount);
        } else {
            setMyPetitions(0);
        }
    }, [petitions, user]);

    // Filter active petitions and polls based on dropdowns
    useEffect(() => {
        // --- Filter Petitions ---
        let filteredP = petitions.filter(p => p.status === "Active");
        if (selectedCategoriy !== 'All Categories') {
            filteredP = filteredP.filter(p => p.category === selectedCategoriy);
        }
        if (selectedCity !== 'All locations') {
            filteredP = filteredP.filter(p => p.location === selectedCity);
        }
        setFilteredActivePetitions(filteredP);

        // --- Filter Polls ---
        if (user) {
            let filteredPl = polls.filter(p => new Date(p.closedAt) >= new Date()); // Active polls
            if (selectedCity !== 'All locations') {
                filteredPl = filteredPl.filter(p => p.targetLocation === selectedCity);
            }
            // No category filter for polls
            setFilteredActivePolls(filteredPl);
        }
    }, [petitions, polls, selectedCity, selectedCategoriy, user]); // ADDED 'polls'


    // --- PollCard Handlers ---
    const handleVote = async (pollId, optionIndex) => {
        try {
            const response = await fetch(`${API_URL}/api/polls/${pollId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ optionIndex })
            });
            const updatedPoll = await response.json();
            if (!response.ok) throw new Error(updatedPoll.msg || 'Failed to vote.');
            setPolls(polls.map(p => p._id === pollId ? updatedPoll : p));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDeletePoll = async (pollId) => {
        if (window.confirm('Are you sure you want to delete this poll ?')) {
            try {
                const response = await fetch(`${API_URL}/api/polls/${pollId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.msg || 'Failed to delete poll.');
                setPolls(polls.filter(p => p._id !== pollId));
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleEditPoll = async (updatedPoll) => {
        try {
            const response = await fetch(`${API_URL}/api/polls/${updatedPoll._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({
                    title: updatedPoll.title,
                    description: updatedPoll.description,
                    options: updatedPoll.options,
                    closedAt: updatedPoll.closedAt
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to update poll.');
            setPolls(polls.map(p => p._id === updatedPoll._id ? data : p));
        } catch (error) {
            alert(error.message);
        }
    }


    return (
        <div className="pt-20 md:pt-25 p-4 bg-gradient-to-b from-sky-200 to-gray-300 min-h-screen md:pl-54 lg:pl-64 lg:pr-10">
            <div className="bg-white rounded-lg shadow py-6 p-4 mb-6">
                <h1 className="text-3xl font-semibold italic">
                    {/* 3. Use the user's name dynamically */}
                    welcome back, <span className="font-bold">{user ? user.name : 'User'}!</span>
                </h1>
                <p className="text-gray-600 mt-2">
                    See what's happening in your community and make your voice heard.
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">

                <div className="bg-white rounded-lg shadow p-4 text-center">
                    <p className="text-gray-700 font-bold">My Petitions</p>
                    <h2 className="text-2xl font-bold">{myPetitions}</h2>
                    <p className="text-gray-500">petitions</p>
                </div>

                <div className="bg-white rounded-lg shadow p-4 text-center">
                    <p className="text-gray-700 font-bold">Successful Petitions</p>
                    <h2 className="text-2xl font-bold">{SuccessfulPetitions}</h2>
                    <p className="text-sm text-gray-500">or under review</p>
                </div>

                <div className="bg-white rounded-lg shadow p-4 text-center">
                    <p className="text-gray-700 font-bold">Polls Created</p>
                    <h2 className="text-2xl font-bold">{userPoll?.totalUserPoll || 0}</h2>
                    <p className="text-gray-500">Polls Created</p>
                </div>
            </div>

            {/* Active Content Filters */}
            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
                {/* Title */}
                <h2 className="text-lg sm:text-xl font-medium text-center mb-4 pb-2 border-b border-gray-400">
                    Active Content Near You
                </h2>

                {/* Mobile Stack, Desktop Flex */}
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

                    {/* Location */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-700 text-sm font-medium min-w-fit">Showing for:</span>
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="flex-1 sm:flex-none bg-gray-600 text-white font-medium px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40">
                            {cities.map((city, index) => (
                                <option key={index} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-700 text-sm font-medium min-w-fit">Category (Petitions):</span>
                        <select
                            value={selectedCategoriy}
                            onChange={(e) => setSelectedCategoriy(e.target.value)}
                            className="flex-1 sm:flex-none bg-gray-600 text-white font-medium px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40">
                            {categories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {loading ? (
                    <p className="text-center py-10 text-gray-500">Loading content...</p>
                ) :
                (filteredActivePetitions.length === 0 && filteredActivePolls.length === 0) ? (
                    <div className='flex justify-center flex-wrap py-6'>

                        <p className='w-full text-center text-2xl sm:font-mono py-2'>no active content found...............</p>

                        <button className='border px-2 text-xl text-white bg-gray-600 rounded-md cursor-pointer hover:bg-gray-400' onClick={() => clearFilter()}>Clear Filter</button>
                    </div>
                ) : null}

            </div>
            
            {/* Active Petitions Section */}
            {!loading && filteredActivePetitions.length > 0 && (
                 <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Petitions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredActivePetitions.map((petition) =>
                            // Note: Passing only user and petition. 
                            // For full functionality (sign, edit, etc.), more handlers would be needed here.
                            <PetitionComponent key={petition._id} petition={petition} user={user} />
                        )}
                    </div>
                </div>
            )}

            {/* Active Polls Section */}
            {!loading && filteredActivePolls.length > 0 && (
                 <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Polls</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredActivePolls.map((poll) => 
                            <PollCard 
                                key={poll._id} 
                                poll={poll} 
                                user={user} 
                                handleVote={handleVote} 
                                handleDeletePoll={handleDeletePoll} 
                                handleEdit={handleEditPoll} />
                        )}
                    </div>
                </div>
            )}

        </div>
    )
}

export default Home;