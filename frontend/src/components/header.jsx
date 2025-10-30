// File: frontend/src/components/header.jsx

import { Link, NavLink } from 'react-router-dom';
import govt_img from '../assets/govt.png';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function Header() {
    const [navClick, setNavClick] = useState(false);
    const [userIconClick, setuserIconClick] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const { user, logout, token } = useAuth();

    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

    // Fetch notifications
    useEffect(() => {
        const loadNotifications = async () => {
            if (user) {
                try {
                    const response = await fetch(`${API_URL}/api/auth/notifications`,
                        { headers: { 'x-auth-token': token } })
                    if (!response.ok) throw new Error('Failed to fetch notifications');
                    const data = await response.json();
                    setNotifications(data);
                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }
            };
        }
        loadNotifications();
    }, [user, API_URL, token]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Mark single notification as read
    const markAsRead = async (id) => {
        try {
            await fetch(`${API_URL}/api/auth/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'x-auth-token': token }
            });
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.warn('Mark as read failed :', error);
        }
    };

    return (
        <>
            <header className="flex flex-wrap justify-between items-center mx-auto bg-gray-100 p-3 shadow-md fixed w-full h-17 z-50">
                {/* ... (Left side remains the same) ... */}
                <div className='flex'>
                    <button
                        className="block text-2xl border rounded-xl hover:text-orange-700 mr-3 md:hidden px-1.5 cursor-pointer"
                        onClick={() => setNavClick(!navClick)} >
                        <i className={`fa-solid fa-bars fa-lg ${navClick ? "text-red-500" : "text-gray-700"}`}></i>
                    </button>
                    <Link to="/" className="md:pl-6 flex items-center text-blue-500 ">
                        <img src={govt_img} className="mr-1 h-12" alt="Logo " />
                        <b className='text-3xl mt-2.5'>Civix</b>
                    </Link>
                </div>

                {/* ... (Middle NavLinks remain the same) ... */}
                <div className="hidden md:flex flex-grow justify-center font-bold text-md ">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `py-2 pr-4 pl-3 ${isActive ? "text-orange-500 border-b-3" : "text-gray-700"} hover:text-orange-700`
                        } >
                        Home
                    </NavLink>
                    <NavLink
                        to="/petitions"
                        className={({ isActive }) =>
                            `py-2 pr-4 pl-3 ${isActive ? "text-orange-500 border-b-3" : "text-gray-700"} hover:text-orange-700`
                        }>
                        Petitions
                    </NavLink>
                    <NavLink
                        to="/polls"
                        className={({ isActive }) =>
                            `py-2 pr-4 pl-3 ${isActive ? "text-orange-500 border-b-3" : "text-gray-700"} hover:text-orange-700`
                        }>
                        Polls
                    </NavLink>
                    <NavLink
                        to="/Reports" // Note: Route in main.jsx is '/reports', case might matter. Consider changing to lowercase '/reports' if needed.
                        className={({ isActive }) =>
                            `py-2 pr-4 pl-3 ${isActive ? "text-orange-500 border-b-3" : "text-gray-700"} hover:text-orange-700`
                        }>
                        Reports
                    </NavLink>
                    <NavLink
                        to="/officials" // Corrected path
                        className={({ isActive }) =>
                            `py-2 pr-4 pl-3 ${isActive ? "text-orange-500 border-b-3" : "text-gray-700"} hover:text-orange-700`
                        }>
                        Officials
                    </NavLink>
                </div>

                <Sidebar navClick={navClick} setNavClick={setNavClick} />

                <div className="flex items-center justify-end ">
                    <NavLink to="/settings" className='h-6 mr-2'>
                        <i className="fa-solid fa-gear fa-lg"></i>
                    </NavLink>
                    <div className='mr-2 cursor-pointer'>
                        <button onClick={() => setNotifOpen(!notifOpen)} className="relative cursor-pointer">
                            <i className="fa-solid fa-bell fa-xl"></i>
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {notifOpen && (
                            <div className="absolute right-0 mt-6 bg-white border rounded shadow-lg min-[400px]:w-80 z-50 max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <p className="p-3 text-gray-500 text-sm">No notifications</p>
                                ) : (
                                    notifications.map(n => (
                                        <div
                                            key={n._id}
                                            onClick={() => markAsRead(n._id)}
                                            className={`p-3 border-b hover:bg-gray-100 cursor-pointer ${n.isRead ? 'text-gray-500' : 'text-black font-medium'
                                                }`} >
                                            {n.message}
                                            <div className="text-xs text-gray-400">
                                                {new Date(n.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    <button onClick={() => setuserIconClick(!userIconClick)}
                        className="text-gray-800 font-bold border rounded-4xl text-sm p-2 px-2.5 cursor-pointer">
                        {user ? user.name : 'Account'}
                    </button>
                </div>

                {/* ... (User dropdown remains the same) ... */}
                 {user && (
                    <div className={`absolute top-full right-0 mt-1 w-auto bg-gray-200 px-4 py-2 z-50 rounded-b-2xl text-center shadow-xl border-l border-b border-gray-400
                        transform transition-transform duration-500 ease-in-out
                        ${userIconClick ? "translate-x-0 mr-1" : "translate-x-[100%]"}`}>
                        <div className='flex items-center pb-1'>
                            <div className="text-gray-800 border rounded-full cursor-pointer w-10 h-10 flex items-center justify-center font-bold bg-gray-300">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className='flex flex-col items-start ml-2 text-left'>
                                <h1 className='font-bold pl-1.5'>{user.name}</h1>
                                <div className='text-md pl-1.5'>{user.role}</div>
                                <div className='text-sm text-gray-600'>{user.email}</div>
                            </div>
                        </div>
                        <button onClick={logout} className='border rounded-4xl bg-orange-400 py-0.5 pb-1 px-5 mt-2.5 cursor-pointer '>logout</button>
                    </div>
                )}
            </header>
        </>
    );
}