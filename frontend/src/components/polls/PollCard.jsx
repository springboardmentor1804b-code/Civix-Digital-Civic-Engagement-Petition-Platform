// File: frontend/src/components/polls/PollCard.jsx

import EditPoll from "./EditPoll";
import { useState } from "react";

const PollCard = ({ poll, user, handleVote, handleDeletePoll, handleEdit }) => {

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const isAuthor = poll.createdBy._id === user._id || poll.createdBy === user._id;
    const userVote = poll.voters.includes(user._id);
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    const authorName = typeof poll.createdBy === 'object' ? poll.createdBy.name : poll.createdBy;
    const isClosed = new Date(poll.closedAt) < new Date();

    return (
        <>
            <EditPoll isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} poll={poll} handleEdit={handleEdit} />
            {/* --- CARD CONTAINER --- */}
            {/* A white background provides clean contrast against your light blue page background. */}
            {/* The shadow and border add depth and a modern feel. */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 flex flex-col w-full justify-between hover:shadow-xl hover:border-blue-300 transition-all duration-300">

                {/* --- TOP ROW: Location & Icons --- */}
                <div className="flex justify-between items-start mb-3">
                    {/* Location Badge */}
                    <p className="text-xs text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
                        <i className="fa-solid fa-location-dot mr-1.5 text-gray-500"></i>
                        {poll.targetLocation}
                    </p>
                    
                    {/* Action Icons */}
                    <div className="flex items-center space-x-4 h-6 text-gray-500">
                        {userVote && (
                            <div className="relative group flex items-center">
                                <i className="fa-regular fa-circle-check text-green-600 text-lg"></i>
                                <span className="absolute right-0 top-7 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                    You voted
                                </span>
                            </div>
                        )}
                        {isAuthor && handleDeletePoll && (
                            <>
                                <button 
                                    onClick={() => setEditModalOpen(true)} 
                                    className="hover:text-blue-600 transition-colors duration-200"
                                    aria-label="Edit poll"
                                >
                                    <i className="fa-solid fa-pencil"></i>
                                </button>
                                <button
                                    onClick={() => handleDeletePoll(poll._id)}
                                    className="hover:text-red-600 transition-colors duration-200"
                                    aria-label="Delete poll"
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* --- CONTENT: Title, Author, Description --- */}
                <div>
                    <h3 className="font-bold text-xl text-gray-800">{poll.title}</h3>
                    <p className="text-sm text-gray-500 font-medium mb-4">
                        Created by <span className="font-semibold text-gray-700">{isAuthor ? "You" : authorName}</span>
                    </p>

                    {poll.description && <p className="text-gray-700 text-sm mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">{poll.description}</p>}
                </div>


                {/* --- POLL OPTIONS --- */}
                <div className="space-y-2 mt-auto">
                    {poll.options.map((option, index) => {
                        const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                        const hasVotedOrIsClosed = isClosed || userVote;

                        return (
                            <div key={index}>
                                {/* Shows results after voting or when closed */}
                                {hasVotedOrIsClosed ? (
                                    <div className="relative rounded-lg p-3 bg-gray-100 overflow-hidden border border-gray-200">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-blue-500/30 rounded-lg" // Semi-transparent blue for a modern look
                                            style={{ width: `${percentage}%`, transition: 'width 0.5s ease-in-out' }}
                                        ></div>
                                        <div className="relative flex justify-between font-semibold text-gray-800">
                                            <span>{option.optionText}</span>
                                            <span className="text-gray-600">{percentage.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                ) : (
                                    /* Clickable button before voting */
                                    <button
                                        onClick={() => handleVote(poll._id, index)}
                                        className="w-full text-left rounded-lg p-3 bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                                    >
                                        <div className="font-semibold text-gray-800">
                                            {option.optionText}
                                        </div>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                {/* --- FOOTER: Votes & Status --- */}
                <div className="flex justify-between items-center text-sm mt-5 pt-4 border-t border-gray-200">
                    <p className="font-bold text-gray-800">{totalVotes} votes</p>
                    <div className="text-right">
                        <span className={`font-semibold px-3 py-1 rounded-full text-xs ${isClosed ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                            {isClosed ? "Closed" : "Active"}
                        </span>
                        <p className="text-gray-500 text-xs mt-1.5">
                            Closes on{" "}
                            {new Date(poll.closedAt).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PollCard;