import { useState, useEffect } from 'react';
import { useAuth } from '/src/context/AuthContext.jsx';
import { EditPetitionModal } from './EditPetitionModal';
import { CreatePetitionModal } from './CreatePetitionModal';
import PetitionComponent from './PetitionComponent';

function Petitions() {

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
    const tabs = [
        { id: "all", label: "All Petitions" },
        { id: "my", label: "My Petitions" },
        { id: "signed", label: "Signed by Me" },
    ];
    const categories = ['All Categories', 'Environment', 'Infrastructure', 'Education', 'Public Safety', 'Transportation', 'Healthcare', 'Housing'];
    const [selectedCategoriy, setSelectedCategori] = useState('All Categories');
    const [selectedCity, setSelectedCity] = useState(cities[0] || "");
    const [selctedStatus, setSelectedStatus] = useState('All');
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [petitions, setPetitions] = useState([]);
    const [filteredPetitions, setFilteredPetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [petitionToEdit, setPetitionToEdit] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

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

    useEffect(() => {
        if (!user) return;
        let filtered = [];
        if (activeTab === 'my') {
            filtered = petitions.filter(p => p.author._id === user._id);
        } else if (activeTab === 'signed') {
            filtered = petitions.filter(p =>
                p.signatures.some(sig => sig._id === user._id)
            );
        } else {
            filtered = petitions;
        }
        if (selectedCategoriy !== 'All Categories') {
            filtered = filtered.filter(p => p.category === selectedCategoriy);
        }
        if (selctedStatus !== 'All') {
            filtered = filtered.filter(p => p.status === selctedStatus);
        }
        if (selectedCity !== 'All locations') {
            filtered = filtered.filter(p => p.location === selectedCity);
        }
        setFilteredPetitions(filtered);
    }, [activeTab, petitions, user, selectedCity, selectedCategoriy, selctedStatus]);


    const handleSignPetition = async (petitionId) => {
        try {
            const response = await fetch(`${API_URL}/api/petitions/${petitionId}/sign`, {
                method: 'POST',
                headers: { 'x-auth-token': token }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to sign petition.');
            setPetitions(petitions.map(p =>
                p._id === petitionId ? data : p
            ));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDeletePetition = async (petitionId) => {
        if (window.confirm('Are you sure you want to delete this petition?')) {
            try {
                const response = await fetch(`${API_URL}/api/petitions/${petitionId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.msg || 'Failed to delete petition.');
                setPetitions(petitions.filter(p => p._id !== petitionId));
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleChangePetitionStatus = async (petition, petitionStatus) => {
        try {
            const response = await fetch(`${API_URL}/api/petitions/${petition._id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status: petitionStatus }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to update petition status.');
            handlePetitionUpdated(data);
        } catch (err) {
            console.error("Update petition status error:", err.message);
            alert(err.message);
        }
    };


    const handleOpenEditModal = (petition) => {
        setPetitionToEdit(petition);
        setEditModalOpen(true);
    };

    const handlePetitionUpdated = (updatedPetition) => {
        // If only author ID is returned, restore the old author object
        const existing = petitions.find(p => p._id === updatedPetition._id);
        const fixed = {
            ...updatedPetition,
            author: updatedPetition.author?._id ? updatedPetition.author : (existing ? existing.author : {}),
            // Ensure comments are also populated
            comments: updatedPetition.comments || (existing ? existing.comments : [])
        };

        setPetitions(petitions.map(p => (p._id === fixed._id ? fixed : p)));
    };

    // NEW HANDLER for when a comment is added
    const handleCommentAdded = (updatedPetition) => {
        handlePetitionUpdated(updatedPetition); // The logic is the same: replace the old petition
    };


    const handlePetitionCreated = (newPetition) => {
        setPetitions(prev => [newPetition, ...prev]);
    };

    return (
        <>
            <CreatePetitionModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onPetitionCreated={handlePetitionCreated} />
            <EditPetitionModal
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                petition={petitionToEdit}
                onPetitionUpdated={handlePetitionUpdated}
            />

            <div className="pt-20 p-4 bg-gradient-to-b from-sky-200 to-gray-300 min-h-screen md:pl-54">
                <div className="">
                    <div className="ml-6 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 font-inria">Petitions</h1>
                            <p className="text-gray-700 mt-1 font-bold">Browse, sign, and track petitions in your community.</p>
                        </div>
                        <button onClick={() => setCreateModalOpen(true)} className="bg-sky-50 font-bold px-5 py-2 rounded-lg hover:bg-blue-300 transition duration-300 mt-4 sm:mt-0 whitespace-nowrap cursor-pointer">
                            + Create Petition
                        </button>
                    </div>

                    <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-200'>
                        <div className="flex flex-col sm:flex-row md:max-[890]:flex-col justify-between items-center space-x-2 mb-6">
                            <div className="hidden min-[452px]:flex sm:max-lg:hidden items-center space-x-1 bg-gray-100 p-1 rounded-lg">
                                {tabs.map(tap => {
                                    return (
                                        <button key={tap.id} onClick={() => setActiveTab(tap.id)} className={`py-2 px-4 rounded-md font-semibold text-sm cursor-pointer hover:text-black ${activeTab === tap.id ? 'bg-white shadow' : 'text-gray-600'}`}>{tap.label}</button>
                                    )
                                })}
                            </div>
                            {/* --- Mobile View (Dropdown) --- */}
                            <div className="min-[452px]:max-sm:hidden lg:hidden relative sm:block w-full ml-2">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="w-full flex justify-between items-center py-2 px-4 border border-gray-300/60 rounded-md bg-gray-100 shadow text-sm font-semibold cursor-pointer">
                                    {tabs.find((t) => t.id === activeTab)?.label}
                                    <span className="ml-2 text-gray-500">▼</span>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg z-10">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => { setActiveTab(tab.id), setDropdownOpen(false) }}
                                                className={`block w-full text-left cursor-pointer py-2 px-4 text-sm hover:bg-gray-100 ${activeTab === tab.id ? "font-serif text-black" : "text-gray-600"}`} >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col min-[520px]:flex-row items-center min-[520px]:space-x-2 max-[520px]:space-y-1 max-[520px]:w-full mt-4 sm:mt-0">
                                <div className="border border-gray-300 rounded-lg p-2 bg-sky-200 flex items-center space-x-2 w-full min-[520px]:w-auto">
                                    <i className="fa-solid fa-location-dot"></i>
                                    <select
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                        className="cursor-pointer text-sm bg-transparent outline-none flex-1">
                                        {cities.map((city, index) => (
                                            <option key={index} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className='border border-gray-300 rounded-lg p-2 bg-sky-200 flex items-center space-x-2 w-full min-[520px]:w-auto'>
                                    <i className="fa-solid fa-filter w-3"></i>
                                    <select className="cursor-pointer text-sm bg-transparent outline-none flex-1"
                                        value={selectedCategoriy}
                                        onChange={(e) => setSelectedCategori(e.target.value)}>
                                        {categories.map((category, index) => (
                                            <option key={index} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className='border border-gray-300 rounded-lg p-2 bg-sky-200 flex items-center space-x-2 w-full min-[520px]:w-auto'>
                                    <i className="fa-solid fa-chart-simple"></i>
                                    status:<select
                                        value={selctedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="cursor-pointer text-sm bg-transparent outline-none flex-1">
                                        <option value="All">All</option>
                                        <option value="Active">Active</option>
                                        <option value="Closed">Closed</option></select>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <p className="text-center py-10 text-gray-500">Loading petitions...</p>
                        ) : filteredPetitions.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed">
                                <p className="text-gray-500">No petitions found for this filter.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPetitions.map((petition) =>
                                    <PetitionComponent
                                        key={petition._id}
                                        petition={petition}
                                        user={user}
                                        token={token}
                                        handleSignPetition={handleSignPetition}
                                        handleChangePetitionStatus={handleChangePetitionStatus}
                                        handleDelete={handleDeletePetition}
                                        handleEdit={handleOpenEditModal}
                                        handleCommentAdded={handleCommentAdded}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Petitions;