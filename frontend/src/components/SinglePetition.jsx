import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../Utils/api"; // 1. Import your central api client
import { toast } from "react-toastify";

const SinglePetition = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [petition, setPetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPetition = async () => {
      try {
        // 2. Use 'api' and a relative path
        const res = await api.get(`/petitions/${id}`);
        setPetition(res.data);
      } catch (err) {
        toast.error("Failed to fetch petition details.");
        navigate("/petitions");
      } finally {
        setLoading(false);
      }
    };
    fetchPetition();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this petition? This action cannot be undone."
      )
    ) {
      try {
        // 3. Use 'api' for the delete request
        await api.delete(`/petitions/${id}`);
        toast.success("Petition deleted successfully.");
        navigate("/petitions");
      } catch (err) {
        toast.error("Failed to delete petition. You may not be the owner.");
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/petitions/${id}/comments`, {
        text: newComment.trim()
      });
      
      // Add the new comment to the petition state
      setPetition(prev => ({
        ...prev,
        comments: [...prev.comments, res.data]
      }));
      
      setNewComment("");
      toast.success("Comment posted successfully!");
    } catch (err) {
      toast.error("Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await api.delete(`/petitions/${id}/comments/${commentId}`);
        
        // Remove the comment from the petition state
        setPetition(prev => ({
          ...prev,
          comments: prev.comments.filter(comment => comment._id !== commentId)
        }));
        
        toast.success("Comment deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete comment.");
      }
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        await api.delete(`/petitions/${id}/files/${fileId}`);
        
        // Remove the file from the petition state
        setPetition(prev => ({
          ...prev,
          supportingFiles: prev.supportingFiles.filter(file => file._id !== fileId)
        }));
        
        toast.success("File deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete file.");
      }
    }
  };

  if (loading)
    return <div className="p-6 text-center">Loading Petition...</div>;
  if (!petition)
    return <div className="p-6 text-center">Petition not found.</div>;

  const isOwner = user && user.id === petition.owner._id;

  return (
    <div className="w-full px-6 lg:max-w-4xl lg:mx-auto lg:px-0">
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
            <p className="text-sm text-gray-600 mt-1">
              {petition.description.split(' ').slice(0, 3).join(' ')}...
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

        {/* Supporting Enclosures Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[#2D3E50] mb-4">
            Supporting Enclosures ({petition.supportingFiles?.length || 0})
          </h3>
          {petition.supportingFiles && petition.supportingFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {petition.supportingFiles.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {file.originalName}
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteFile(file._id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  {/* File Preview */}
                  <div className="aspect-video bg-gray-100 rounded border flex items-center justify-center">
                    {file.mimetype.startsWith('image/') ? (
                      <img
                        src={`http://localhost:5000${file.url}`}
                        alt={file.originalName}
                        className="max-w-full max-h-full object-contain rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs">PDF Document</span>
                      </div>
                    )}
                    <div className="hidden flex-col items-center text-gray-500">
                      <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">Preview not available</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No supporting files uploaded.</p>
          )}
        </div>

        {/* Community Discussion Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[#2D3E50] mb-4">
            Community Discussion ({petition.comments?.length || 0})
          </h3>
          
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts or evidence..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#E84C3D] resize-none"
              rows="4"
            />
            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className="mt-3 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition disabled:bg-gray-300"
            >
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {petition.comments && petition.comments.length > 0 ? (
              petition.comments.map((comment) => (
                <div key={comment._id} className="border-l-4 border-gray-200 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {comment.user?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {(user && (user.id === comment.user?._id || isOwner)) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 mt-1">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePetition;
