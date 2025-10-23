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
      </div>
    </div>
  );
};

export default SinglePetition;
