import { useState, useEffect } from 'react';

// --- Petition Details Modal Component ---
const PetitionDetailsModal = ({ isOpen, onClose, petition, token, user, onCommentAdded }) => {
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState([]);
    const [loadingComment, setLoadingComment] = useState(false);
    const [error, setError] = useState("");

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

    if (!isOpen || !petition) return null;

    return (
        <div className="fixed inset-0 bg-opacity-60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
            {/* Make modal scrollable internally */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative border border-black flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-3xl font-light z-10">&times;</button>

                {/* Scrollable Content Area */}
                <div className="overflow-y-auto p-8">
                    <h2 className="text-3xl font-bold mb-2">{petition.title}</h2>
                    <div className='flex justify-between border-b mb-4'>
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
                    <div className="border-t border-gray-300 pt-6">
                        <h3 className="text-xl font-bold mb-4">Comments ({comments.length})</h3>

                        {/* Comment Form */}
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
                        </form>

                        {/* Comment List */}
                        <div className="space-y-4">
                            {comments.length > 0 ? (
                                comments.slice().reverse().map((comment) => ( // Show newest first
                                    <div key={comment._id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-gray-800">{comment.user ? comment.user.name : "User"}</span>
                                            <span className="text-xs text-gray-500">{new Date(comment.date).toLocaleString()}</span>
                                        </div>
                                        <p className="text-gray-700">{comment.text}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                            )}
                        </div>
                    </div>
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
                            { (handleEdit && handleDelete) && (<>
                            <button onClick={() => handleEdit(petition)} className="text-gray-600 hover:text-blue-600 cursor-pointer">
                                <i className="fa-solid fa-pencil"></i>
                                </button>
                            <button onClick={() => handleDelete(petition._id)} className="text-red-500 hover:text-red-700 cursor-pointer">
                                <i className="fa-solid fa-trash"></i>
                            </button>
                            </> )}
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
                                <button onClick={() => handleSignPetition(petition._id)} className="bg-blue-50 font-semibold px-3 py-1 rounded-full hover:bg-blue-200 text-xs cursor-pointer">Sign Petition</button>
                        )}
                    </div>
                </div>
            </div></>
    )
}