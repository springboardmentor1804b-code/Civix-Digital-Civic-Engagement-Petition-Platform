import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Utils/api"; // 1. Import your central api client
import { toast } from "react-toastify";

const PETITION_CATEGORIES = [
  "Environment",
  "Infrastructure",
  "Education",
  "Public Safety",
  "Transportation",
  "Healthcare",
  "Housing",
  "Other",
];

const EditPetition = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPetition = async () => {
      try {
        // 2. Use 'api' and a relative path to fetch data
        const res = await api.get(`/petitions/${id}`);
        setFormData({
          title: res.data.title,
          description: res.data.description,
          category: res.data.category,
        });
      } catch (err) {
        toast.error("Could not load petition data to edit.");
        navigate("/petitions");
      } finally {
        setLoading(false);
      }
    };
    fetchPetition();
  }, [id, navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 3. Use 'api' for the update request
      await api.put(`/petitions/${id}`, formData);
      toast.success("Petition updated successfully!");
      navigate(`/petitions/${id}`);
    } catch (err) {
      toast.error("Failed to update petition. You may not be the owner.");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading form...</div>;

  return (
    <div className="w-full px-6 lg:max-w-4xl lg:mx-auto lg:px-0">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Petition</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-8">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="category"
            className="block text-gray-700 font-bold mb-2"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {PETITION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-gray-700 font-bold mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
        >
          Update Petition
        </button>
      </form>
    </div>
  );
};

export default EditPetition;
