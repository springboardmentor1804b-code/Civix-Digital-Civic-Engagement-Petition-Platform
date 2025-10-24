import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../Utils/api";
import { toast } from "react-toastify";

// --- ABSOLUTE BASE URL DEFINITION (FINAL ATTEMPT: HARDCODE LOCAL BACKEND) ---
// Since the frontend is on port 3000 and the backend on 5000, 
// we must explicitly point to the backend's root URL (where static files are served).
const ABSOLUTE_BACKEND_ROOT = 'http://localhost:5000'; 
// ----------------------------------------------------------------------------

// --- START: CommentForm and CommentList Components ---

// Component for a single comment display
const CommentItem = ({ comment }) => {
    const isOfficial = comment.user?.role?.toLowerCase()?.includes('official');

    return (
        <div className="border-b border-gray-100 py-3">
            <div className="flex items-center justify-between">
                <p className={`text-sm font-semibold ${isOfficial ? 'text-blue-600' : 'text-[#2D3E50]'}`}>
                    {comment.user.name || "Anonymous"} 
                    {isOfficial && <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">Official</span>}
                </p>
                <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                </span>
            </div>
            <p className="text-gray-700 mt-1 whitespace-pre-wrap">{comment.text}</p>
        </div>
    );
};

// Component for the comment submission form
const CommentForm = ({ petitionId, onCommentCreated }) => {
    const { user } = useAuth();
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await api.post(`/petitions/${petitionId}/comments`, { text });
            toast.success("Comment posted!");
            onCommentCreated(res.data); 
            setText('');
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to post comment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="p-4 bg-gray-100 text-gray-600 rounded-lg text-center">
                Please log in to leave a comment.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your thoughts or evidence..."
                rows="3"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#E84C3D]"
                required
            />
            <button
                type="submit"
                disabled={isSubmitting || !text.trim()}
                className="mt-2 px-4 py-2 bg-[#2D3E50] text-white font-semibold rounded-lg hover:bg-[#1C2833] transition disabled:bg-gray-400"
            >
                {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
        </form>
    );
};
// --- END: CommentForm and CommentList Components ---


const SinglePetition = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [petition, setPetition] = useState(null);
  const [comments, setComments] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Function to fetch the comments
  const fetchComments = async (petitionId) => {
    try {
      const res = await api.get(`/petitions/${petitionId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Could not fetch comments:", err);
    }
  };

  useEffect(() => {
    const fetchPetitionAndComments = async () => {
      setLoading(true);
      try {
        // Fetch Petition Details
        const res = await api.get(`/petitions/${id}`);
        setPetition(res.data);

        // Fetch Comments
        await fetchComments(id);

      } catch (err) {
        toast.error("Failed to fetch petition details.");
        navigate("/petitions");
      } finally {
        setLoading(false);
      }
    };
    fetchPetitionAndComments();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this petition? This action cannot be undone."
      )
    ) {
      try {
        await api.delete(`/petitions/${id}`);
        toast.success("Petition deleted successfully.");
        navigate("/petitions");
      } catch (err) {
        toast.error("Failed to delete petition. You may not be the owner.");
      }
    }
  };
  
  // Function to prepend new comment to the list
  const handleCommentCreated = (newComment) => {
    setComments((prevComments) => [newComment, ...prevComments]);
  };

  if (loading)
    return <div className="p-6 text-center">Loading Petition...</div>;
  if (!petition)
    return <div className="p-6 text-center">Petition not found.</div>;

  const isOwner = user && user.id === petition.owner._id;
  
  // Helper to determine if a URL is an image based on file extension
  const isImage = (url) => {
      // The URL from the DB is 'uploads/filename.jpg'
      return url.match(/\.(jpeg|jpg|png|gif)$/i);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-sm font-semibold text-[#E84C3D] uppercase">
              {petition.category}
            </span>
            <h1 className="text-3xl font-bold text-[#2D3E50] mt-2">
              {petition.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Created by {petition.owner.name} on{" "}
              {new Date(petition.createdAt).toLocaleDateString()}
            </p>
          </div>
          {isOwner && (
            <div className="flex space-x-2 flex-shrink-0">
              <Link
                to={`/petitions/${id}/edit`}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        <hr className="my-6" />
        <p className="text-gray-700 whitespace-pre-wrap">
          {petition.description}
        </p>
        
        {/* 🖼️ START: ENCLOSURE DISPLAY LOGIC */}
        {petition.enclosures && petition.enclosures.length > 0 && (
            <div className="mt-8 pt-4 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-[#2D3E50] mb-4">Supporting Enclosures ({petition.enclosures.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {petition.enclosures.map((url, index) => (
                        <div key={index} className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                            
                            {/* Check if it's an image */}
                            {isImage(url) ? (
                                // Display image
                                <a href={`${ABSOLUTE_BACKEND_ROOT}/${url}`} target="_blank" rel="noopener noreferrer">
                                <img src={`/${url}`} alt={`Enclosure ${index + 1}`}   className="w-full h-48 object-cover cursor-pointer hover:opacity-75 transition-opacity"></img>
                                </a>
                            ) : (
                                // Display document link
                                <div className="p-4 flex items-center justify-between bg-gray-50">
                                    <span className="text-sm text-gray-700 truncate mr-3">
                                        {url.substring(url.lastIndexOf('/') + 1)} 
                                    </span>
                                    <a 
                                        // FIX: Use the full absolute URL for document links
                                        href={`${ABSOLUTE_BACKEND_ROOT}/${url}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex-shrink-0 text-[#E84C3D] hover:text-red-600 text-sm font-medium"
                                    >
                                        View Document 📄
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}
        {/* 🖼️ END: ENCLOSURE DISPLAY LOGIC */}
        
        {/* 💬 START: COMMENT SECTION */}
        <div className="mt-10 pt-4 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-[#2D3E50] mb-5">
                Community Discussion ({comments.length})
            </h2>

            {/* Comment Form */}
            <CommentForm 
                petitionId={id} 
                onCommentCreated={handleCommentCreated} 
            />

            {/* Comment List */}
            {comments.length > 0 ? (
                <div className="bg-white">
                    {comments.map((comment) => (
                        <CommentItem key={comment._id} comment={comment} />
                    ))}
                </div>
            ) : (
                <div className="text-gray-500 p-4 border border-gray-200 rounded-lg text-center">
                    Be the first to comment on this petition!
                </div>
            )}
        </div>
        {/* 💬 END: COMMENT SECTION */}
        
      </div>
    </div>
  );
};

export default SinglePetition;