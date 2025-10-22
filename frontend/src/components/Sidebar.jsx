// File: frontend/src/components/Sidebar.jsx

import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar({ navClick, setNavClick }) {
    const { logout } = useAuth();
    return (
        <div
            className={`fixed top-17 left-0 h-[calc(100vh-64px)] bg-gray-100 font-bold px-4 py-6 shadow-md z-50 transform transition-transform duration-500 ease-in-out ${navClick ? "translate-x-0" : "translate-x-[-100%]"} md:translate-x-0`} >
            <div className="flex flex-col h-full">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `block border-b-2 border-r-2 my-1.5 p-2 px-4 rounded-xl border-t-white bg-white ${isActive ? "text-orange-500 border-orange-400" : "text-gray-700  border-gray-400"} 
                        hover:text-orange-700 hover:shadow-2xl`}
                    onClick={() => setNavClick(false)}>
                    <i className="fa-solid fa-house mr-2"></i>
                    Home
                </NavLink>
                <NavLink
                    to="/petitions"
                    className={({ isActive }) =>
                        `block border-b-2 border-r-2 my-1.5 p-2 px-4 rounded-xl border-t-white bg-white ${isActive ? "text-orange-500 border-orange-400" : "text-gray-700  border-gray-400"} 
                        hover:text-orange-700 hover:shadow-2xl`}
                    onClick={() => setNavClick(false)}>
                    <i className="fa-regular fa-file-zipper mr-2"></i>
                    Petitions
                </NavLink>
                <NavLink
                    to="/polls"
                    className={({ isActive }) =>
                        `block border-b-2 border-r-2 my-1.5 p-2 px-4 rounded-xl border-t-white bg-white ${isActive ? "text-orange-500 border-orange-400" : "text-gray-700  border-gray-400"} 
                        hover:text-orange-700 hover:shadow-2xl`}
                    onClick={() => setNavClick(false)}>
                    <i className="fa-solid fa-square-poll-vertical mr-2"></i>
                    Polls
                </NavLink>
                <NavLink
                    to="/Reports"
                    className={({ isActive }) =>
                        `block border-b-2 border-r-2 my-1.5 p-2 px-4 rounded-xl border-t-white bg-white ${isActive ? "text-orange-500 border-orange-400" : "text-gray-700  border-gray-400"} 
                        hover:text-orange-700 hover:shadow-2xl`}
                    onClick={() => setNavClick(false)}>
                    <i className="fa-solid fa-signal mr-2"></i>
                    Reports
                </NavLink>
                <NavLink
                    to="/Oficials"
                    className={({ isActive }) =>
                        `block border-b-2 border-r-2 my-1.5 p-2 px-4 rounded-xl border-t-white bg-white ${isActive ? "text-orange-500 border-orange-400" : "text-gray-700  border-gray-400"} 
                        hover:text-orange-700 hover:shadow-2xl`}
                    onClick={() => setNavClick(false)}>
                    <i className="fa fa-user mr-2" ></i>
                    Officials</NavLink>
                <div className="mt-auto">
                    <NavLink
                        to="/settings" // UPDATED
                        className={({ isActive }) =>
                            `block border-b-2 border-r-2 my-1.5 p-2 px-4 rounded-xl border-t-white bg-white ${isActive ? "text-orange-500 border-orange-400" : "text-gray-700  border-gray-400"} 
                        hover:text-orange-700 hover:shadow-2xl`}
                        onClick={() => setNavClick(false)}
                    >
                        <i className="fa-solid fa-gear mr-2"></i>
                        Settings</NavLink> {/* UPDATED */}
                    <NavLink
                        to="/help-support" // UPDATED
                        className={({ isActive }) =>
                            `block border-b-2 border-r-2 my-1.5 p-2 px-4 rounded-xl border-t-white bg-white ${isActive ? "text-orange-500 border-orange-400" : "text-gray-700  border-gray-400"} 
                        hover:text-orange-700 hover:shadow-2xl`}
                        onClick={() => setNavClick(false)}>
                        <i className="fa-regular fa-circle-question mr-1"></i>
                        Help & Support</NavLink>
                    <NavLink
                        to="#"
                        className="block border-b-2 border-r-2 my-1.5 p-2 px-4 rounded-xl bg-orange-100 text-red-700 hover:bg-orange-300 hover:text-black items-center"
                        onClick={logout}>
                        <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>
                        Logout
                    </NavLink>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;