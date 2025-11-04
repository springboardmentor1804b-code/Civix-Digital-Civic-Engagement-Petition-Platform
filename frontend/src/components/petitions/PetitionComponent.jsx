import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

function CommentText({ text }) {
    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const pRef = useRef(null);

    useEffect(() => {
        const el = pRef.current;
        if (el) {
            const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
            const maxHeight = lineHeight * 2; // 2 lines
            setIsOverflowing(el.scrollHeight > maxHeight + 2); // small buffer for rounding
        }
    }, [text]);

    return (
        <div>
            <p
                ref={pRef}
                className={`text-gray-700 leading-6 overflow-hidden transition-all duration-300 ${expanded ? "max-h-none" : "max-h-[3rem]"
                    }`}
            >
                {text}
            </p>

            {isOverflowing && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-blue-500 text-xs mt-1 cursor-pointer"
                >
                    {expanded ? "Read less" : "Read more"}
                </button>
            )}
        </div>
    );
}

{ /* Upvote/Downvote and Reply Buttons */ }
const Upvote_Downvote_Reply = ({ comment, setOpenReply, activeReply, setActiveReply, petition, handleReplySubmit, handelVoteSubmit, replyText, setReplyText }) => {
    const { user } = useAuth();

    const handelVote = (type) => {
        if (type === "up") {
            !(comment.upVote.some((u) => u === user._id)) &&
                handelVoteSubmit(comment._id, type)
        } else {
            !(comment.downVote.some((u) => u === user._id)) &&
                handelVoteSubmit(comment._id, type)
        }
    }

    return <>
        <div className='flex flex-wrap items-stretch mt-2 gap-2'>
            <div className='flex shadow-sm rounded-xl bg-white h-full'>
                {/* Upvote Button */}
                 <button onClick={() => handelVote("up")} className="px-2 py-1 border-r-2 border-gray-100 focus:outline-none cursor-pointer flex items-center">
                    {comment?.upVote && comment.upVote.find(u => u === (user ? user._id : null)) ?
                        <i className="fa-solid fa-thumbs-up text-blue-600"></i> : <i className="fa-regular fa-thumbs-up text-gray-600"></i>}
                    <span className="text-xs text-gray-500 ml-1">{comment?.upVote?.length || 0}</span>
                </button>

                {/* Downvote Button */}
                <button onClick={() => handelVote("down")} className="px-2 py-1 focus:outline-none cursor-pointer flex items-center">
                    {comment?.downVote && comment.downVote.find(u => u === (user ? user._id : null)) ?
                        <i className="fa-solid fa-thumbs-down text-red-500"></i> : <i className="fa-regular fa-thumbs-down text-gray-600"></i>}
                    <span className="text-xs text-gray-500 ml-1">{comment?.downVote?.length || 0}</span>
                </button>
            </div>

            {setOpenReply && comment.reply?.length > 0 && <button
                onClick={() => setOpenReply((openReply)=>openReply === comment._id ? null : comment._id)} className="px-2.5 bg-white rounded-xl shadow-sm text-xs text-gray-600/90 cursor-pointer">
                <i className="fa-regular fa-comment-dots mr-1"></i>{comment.reply?.length}</button>}

            {/* Reply Button */}
            {petition && petition.status !== "Closed" &&
                <button
                    onClick={() =>
                        setActiveReply(activeReply === comment._id ? null : comment._id)
                    }
                    className="px-2 py-1 bg-white rounded-xl shadow-sm text-xs text-blue-600 cursor-pointer h-full flex items-center"
                >
                    <i className="fa-solid mr-1 fa-reply"></i>
                    {activeReply === comment._id ? "Cancel" : "Reply"}
                </button>}
        </div>
        {/* Reply Input Box */}
        {
            activeReply === comment._id && (
                <div className="mt-2 flex-wrap items-center space-x-2 space-y-1">
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 w-full sm:w-[calc(100%-60px)] border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <button
                        onClick={() => handleReplySubmit(comment._id)}
                        className="bg-blue-500 text-white text-xs px-3 py-1.5 cursor-pointer rounded-md hover:bg-blue-600" >
                        Send
                    </button>
                </div>
            )
        }
    </>
}

// --- Petition Details Modal Component ---
const PetitionDetailsModal = ({ isOpen, onClose, petition, onCommentAdded }) => {
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState([]);
    const [loadingComment, setLoadingComment] = useState(false);
    const [error, setError] = useState("");
    const { token } = useAuth();
    const [activeReply, setActiveReply] = useState(null);
    const [openReply, setOpenReply] = useState(null);
    const [replyText, setReplyText] = useState("")

    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

    // Update internal comments state if the petition prop changes
    useEffect(() => {
        if (petition) {
            setComments(petition.comments || []);
        }
    }, [petition]);


    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoadingComment(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/petitions/${petition._id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ text: newComment }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to post comment.');

            // Pass the entire updated petition back to the parent
            onCommentAdded(data);
            setNewComment(""); // Clear input
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingComment(false);
        }
    };

    const handelVoteSubmit = async (commentId, type) => {
        try {
            const response = await fetch(`${API_URL}/api/petitions/${petition._id}/comment/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ commentId, type }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to vote on comment.');
            // Update the specific comment in state with returned data
            setComments(prev =>
                prev.map(comment => {
                    // Case 1: top-level comment
                    if (comment._id === data._id) return data;

                    // Case 2: nested reply
                    if (comment.reply && comment.reply.length > 0) {
                        const updatedReplies = comment.reply.map(r =>
                            r._id === data._id ? data : r
                        );
                        return { ...comment, reply: updatedReplies };
                    }

                    return comment;
                })
            );

        } catch (err) {
            console.error("Error voting on comment:", err);
        }

    }

    const handleReplySubmit = async (commentId) => {
        if (!replyText.trim()) return;

        try {
            const response = await fetch(`${API_URL}/api/petitions/${petition._id}/comment/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ text: replyText, parentCommentId: commentId }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to post reply.');

            // Update the specific comment in state with returned data
            const updatedComment = data.comments.find(c => c._id === commentId);
            if (!updatedComment) return;

            setComments(prev =>
                prev.map(c => c._id === commentId ? updatedComment : c)
            );
            setActiveReply(null);
            setReplyText("");
            setOpenReply(commentId);
        } catch (err) {
            console.error("Error adding reply:", err);
        }
    };


    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hr ago`;
        const days = Math.floor(hours / 24);
        if (days < 365) return `${days} day${days > 1 ? "s" : ""} ago`;
        const years = Math.floor(days / 365);
        return `${years} year${years > 1 ? "s" : ""} ago`;
    };

    if (!isOpen || !petition) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-2 sm:p-4">

            {/* Make modal scrollable internally */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative border border-black flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 px-2 pb-1 transition text-gray-400 hover:text-white rounded-md hover:bg-red-600 text-3xl font-light cursor-pointer">&times;</button>

                {/* Scrollable Content Area */}
                <div className="overflow-y-auto p-8">
                    <h2 className="text-3xl font-bold mb-2">{petition.title}</h2>
                    <div className='flex flex-wrap justify-between border-b mb-4'>
                        <p className="text-lg text-gray-900 mb-3">by <b>{petition.author.name}</b></p>
                        <p className="text-md text-gray-700 mb-1"><span className="font-semibold">Category:</span> {petition.category}</p>
                    </div>

                    <p className=" whitespace-pre-wrap leading-relaxed pb-3 mb-2 border-b border-gray-300">{petition.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                        <span className='font-semibold'>Created on: {new Date(petition.date).toLocaleDateString()}</span>
                        <span
                            className={`px-3 py-1 rounded-full font-bold ${petition.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                        >
                            {petition.status}
                        </span>
                    </div>

                    {/* --- NEW COMMENT SECTION --- */}
                    {onCommentAdded && <div className="border-t border-gray-300 pt-6">
                        <h3 className="text-xl font-bold mb-4">Comments ({comments.length})</h3>

                        {/* Comment Form */}
                        {petition.status !== "Closed" &&
                            <form onSubmit={handleCommentSubmit} className="mb-4">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add your comment..."
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    rows="3"
                                ></textarea>
                                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={loadingComment || !newComment.trim()}
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {loadingComment ? "Posting..." : "Post Comment"}
                                </button>
                            </form>}

                        {/* Comment List */}
                        <div className="space-y-4">
                            {comments.length > 0 ? (
                                comments.slice().reverse().map((comment) => ( // Show newest first
                                    <div key={comment._id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-gray-800">{comment.user ? comment.user.name : "User"}</span>
                                                <span className="text-xs text-gray-500">{timeAgo(comment.date)}</span>
                                            </div>
                                            <CommentText text={comment.text}/>
                                        </div>

                                        <Upvote_Downvote_Reply comment={comment} setOpenReply={setOpenReply} activeReply={activeReply} setActiveReply={setActiveReply} petition={petition} handleReplySubmit={handleReplySubmit} handelVoteSubmit={handelVoteSubmit} replyText={replyText} setReplyText={setReplyText} />

                                        {/* Replies */}
                                        {openReply === comment._id && comment.reply.length > 0 && (
                                            <div className="mt-3 pl-4 border-l-2 border-gray-300">
                                                {comment.reply.slice().reverse().map((reply) => (
                                                    <div key={reply._id} className="bg-gray-100 p-2 rounded-lg mb-2 border border-gray-200">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-semibold text-gray-800">{reply.user ? reply.user.name : "User"}</span>
                                                            <span className="text-xs text-gray-500">{timeAgo(reply.date)}</span>
                                                        </div>
                                                        <CommentText text={reply.text}/>

                                                        <Upvote_Downvote_Reply comment={reply} handelVoteSubmit={handelVoteSubmit} />

                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (petition.status !== "Closed" &&
                                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                            )}
                        </div>
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default function PetitionComponent({ petition, user, token, handleSignPetition, handleChangePetitionStatus, handleDelete, handleEdit, handleCommentAdded }) {

    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);

    if (!user) return null;

    const isSigned = petition.signatures.some(sig => sig._id === user._id);
    const isAuthor = petition.author._id === user._id;
    const isPublic_officer = user.role === 'Public_officer';


    return (
        <>
            <PetitionDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                petition={petition}
                user={user} // Pass user
                token={token} // Pass token
                onCommentAdded={handleCommentAdded} // Pass handler
            />
            <div className="bg-[#a8e6f4] border border-gray-200 rounded-3xl shadow-sm p-5 flex flex-col w-full justify-between hover:shadow-lg hover:shadow-gray-400 hover:border-gray-600 transition-shadow">
                <div>
                    {isAuthor && (
                        <div className="relative flex justify-end space-x-4">
                            {(handleEdit && handleDelete) && (<>
                                <button onClick={() => handleEdit(petition)} className="text-gray-600 hover:text-blue-600 cursor-pointer">
                                    <i className="fa-solid fa-pencil"></i>
                                </button>
                                <button onClick={() => handleDelete(petition._id)} className="text-red-500 hover:text-red-700 cursor-pointer">
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </>)}
                        </div>
                    )}
                    <h3 className="font-bold text-lg mb-1">{petition.title}</h3>

                    <p className="text-gray-600 mb-4 min-h-15 leading-relaxed line-clamp-3 ">{petition.description}</p>
                </div>
                <div>
                    <div className="text-sm font-semibold text-gray-700 mb-4">
                        <div className='flex justify-between'>
                            <div>
                                <span className="font-bold">{petition.signatures.length}</span> of {petition.signatureGoal} signatures
                            </div>
                            <div>
                                {isPublic_officer && handleChangePetitionStatus ?
                                    <select
                                        value={petition.status} // Controlled component
                                        onChange={(e) => handleChangePetitionStatus(petition, e.target.value)}
                                        className={`ml-2 px-2 py-0.5 ${petition.status === "Active"
                                            ? "text-green-800"
                                            : "text-red-800"
                                            } rounded-full text-md font-semibold cursor-pointer`}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Under_Review">Under Review</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                    :
                                    <span className={`ml-2 px-2 py-0.5 text-md ${(petition.status === "Active") ? "text-blue-700" : "text-red-800"} rounded-full font-semibold`}>{petition.status}</span>}
                            </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 mt-2">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${Math.min(100, (petition.signatures.length / petition.signatureGoal) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <button onClick={() => setDetailsModalOpen(true)} className="text-blue-600 font-semibold hover:underline text-sm cursor-pointer">View Details</button>
                        {isSigned || isAuthor ? (
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${isAuthor ? 'bg-gray-200 text-gray-700' : 'bg-green-200 text-green-800'}`}>
                                {isAuthor ? 'Author' : 'Signed'}
                            </span>
                        ) : (handleSignPetition &&
                            <button disabled={petition.status === "Closed"} onClick={() => handleSignPetition(petition._id)} className={`bg-blue-50 font-semibold px-3 py-1 rounded-full hover:bg-blue-200 text-xs ${petition.status === "Closed" ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}>Sign Petition</button>
                        )}
                    </div>
                </div>
            </div></>
    )
}