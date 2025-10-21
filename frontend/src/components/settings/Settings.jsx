import { useState } from 'react';
import { useAuth } from '/src/context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

function Settings() {
    const { user, token, logout, loading } = useAuth();
    const navigate = useNavigate();

    // State for profile updates
    const [name, setName] = useState(user?.name || '');
    const [location, setLocation] = useState(user?.location || '');
    
    // State for password change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State for messages
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [deleteMessage, setDeleteMessage] = useState({ type: '', text: '' });

    if (loading) {
        return <div className="pt-20 p-4 min-h-screen bg-gradient-to-b from-sky-200 to-gray-300 md:pl-54 text-center">Loading...</div>;
    }

    // --- Handlers ---

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMessage({ type: '', text: '' });
        if (name === user.name && location === user.location) {
            setProfileMessage({ type: 'error', text: 'No changes detected.' });
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/auth/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ name, location }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to update profile.');
            
            setProfileMessage({ type: 'success', text: 'Profile updated successfully! Refreshing...' });
            // Reload user data in AuthContext by logging out and back in (or add a dedicated refreshUser method to context)
            setTimeout(() => window.location.reload(), 1500); 
        } catch (err) {
            setProfileMessage({ type: 'error', text: err.message });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        if (newPassword.length < 6) {
             setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to change password.');

            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err.message });
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteMessage({ type: '', text: '' });
        if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/auth/user', {
                method: 'DELETE',
                headers: { 'x-auth-token': token },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to delete account.');

            setDeleteMessage({ type: 'success', text: 'Account deleted. Logging out...' });
            setTimeout(() => {
                logout();
                navigate('/');
            }, 2000);
        } catch (err) {
            setDeleteMessage({ type: 'error', text: err.message });
        }
    };

    // Helper to show messages
    const Message = ({ message }) => {
        if (!message.text) return null;
        const color = message.type === 'success' ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100';
        return <p className={`p-3 rounded-lg mb-4 text-sm font-semibold ${color}`}>{message.text}</p>;
    };


    return (
        <div className="pt-20 p-4 bg-gradient-to-b from-sky-200 to-gray-300 min-h-screen md:pl-54">
            <div className="pl-6 pt-6">
                <h1 className="text-3xl font-bold text-gray-800 font-inria">Settings</h1>
                <p className="text-gray-700 mt-1 font-bold">Manage your account and preferences.</p>
            </div>

            {/* --- Profile Settings --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Your Profile</h2>
                <form onSubmit={handleProfileUpdate}>
                    <Message message={profileMessage} />
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                        <input 
                            type="text" 
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400" 
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            value={user?.email || ''}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" 
                            disabled 
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                        <input 
                            type="text"
                            id="location" 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., Mumbai, MH"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400" 
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-bold transition duration-300">
                        Save Profile Changes
                    </button>
                </form>
            </div>

            {/* --- Change Password --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Change Password</h2>
                <form onSubmit={handlePasswordChange}>
                    <Message message={passwordMessage} />
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                        <input 
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400" 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                        <input 
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400" 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                        <input 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400" 
                        />
                    </div>
                    <button type="submit" className="w-full bg-gray-700 text-white p-3 rounded-lg hover:bg-gray-800 font-bold transition duration-300">
                        Update Password
                    </button>
                </form>
            </div>

             {/* --- Delete Account --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-red-700 mb-4">Danger Zone</h2>
                <Message message={deleteMessage} />
                <p className="text-gray-600 mb-4">Once you delete your account, all of your petitions, polls, and votes will be permanently removed. This action cannot be undone.</p>
                <button 
                    onClick={handleDeleteAccount}
                    className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-800 font-bold transition duration-300"
                >
                    Delete My Account
                </button>
            </div>
        </div>
    );
}

export default Settings;