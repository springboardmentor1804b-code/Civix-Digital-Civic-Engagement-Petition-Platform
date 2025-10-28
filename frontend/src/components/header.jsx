// File: frontend/src/components/header.jsx

import { Link, NavLink } from 'react-router-dom';
import govt_img from '../assets/govt.png';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function Header() {
    const [navClick, setNavClick] = useState(false);
    const [userIconClick, setuserIconClick] = useState(false);
    const { user, logout } = useAuth();

    return (
        <>
            <header className="flex flex-wrap justify-between items-center mx-auto bg-gray-100 p-3 shadow-md fixed w-full h-17">
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

                <div className="hidden md:flex flex-row w-1/2 font-bold text-md ">
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
                        to="/Reports"
                        className={({ isActive }) =>
                            `py-2 pr-4 pl-3 ${isActive ? "text-orange-500 border-b-3" : "text-gray-700"} hover:text-orange-700`
                        }>
                        Reports
                    </NavLink>
                    <NavLink
                        to="/Officials"
                        className={({ isActive }) =>
                            `py-2 pr-4 pl-3 ${isActive ? "text-orange-500 border-b-3" : "text-gray-700"} hover:text-orange-700`
                        }>
                        Officials
                    </NavLink>
                </div>

                <Sidebar navClick={navClick} setNavClick={setNavClick} />

                <div className="flex items-end justify-end ">
                    <NavLink to="/Sitting" className='h-7 mr-2'>
                        <i className="fa-solid fa-gear fa-lg"></i>
                    </NavLink>
                    <div className='mr-1 cursor-pointer'>
                        <img src='https://cdn-icons-png.flaticon.com/512/565/565422.png' className="mr-1 h-7" alt="Logo " />
                    </div>
                    <button onClick={() => setuserIconClick(!userIconClick)}
                        className="text-gray-800 font-bold border rounded-4xl text-sm p-2 px-2.5 cursor-pointer">
                        {user ? user.name : 'Account'}
                    </button>
                </div>

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