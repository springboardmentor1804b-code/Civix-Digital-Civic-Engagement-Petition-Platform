import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Utils/api"; // 1. Import your central api client
import { toast } from "react-toastify";

const EditPoll = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ question: "", description: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        // 2. Use 'api' and a relative path
        const res = await api.get(`/polls/${id}`);
        setFormData({
          question: res.data.question,
          description: res.data.description,
        });
      } catch (err) {
        toast.error("Could not load poll data.");
        navigate("/polls");
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [id, navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 3. Use 'api' for the update request
      await api.put(`/polls/${id}`, formData);
      toast.success("Poll updated successfully!");
      navigate("/polls");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update poll.");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="w-full px-6 lg:max-w-4xl lg:mx-auto lg:px-0">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Poll</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-8">
        <div className="mb-4">
          <label
            htmlFor="question"
            className="block text-gray-700 font-semibold mb-2"
          >
            Question
          </label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E84C3D]"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-gray-700 font-semibold mb-2"
          >
            Description
          </label>
          <textarea
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E84C3D]"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
        >
          Update Poll
        </button>
      </form>
    </div>
  );
};

export default EditPoll;
