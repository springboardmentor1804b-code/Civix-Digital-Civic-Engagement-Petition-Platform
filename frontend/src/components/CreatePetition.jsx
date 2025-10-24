import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import api from "../Utils/api";

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

const CreatePetition = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // 1. Text/Number Form State
  const [formData, setFormData] = useState({
    title: "",
    category: PETITION_CATEGORIES[0],
    location: user?.location || "",
    signatureGoal: 100,
    description: "",
  });
    // 💡 NEW: State for selected files
    const [enclosures, setEnclosures] = useState([]);
    
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
    
    // 💡 NEW: Handle file selection
    const handleFileChange = (e) => {
        // Limit to 5 files, matching the backend limit
        const selectedFiles = Array.from(e.target.files).slice(0, 5); 
        setEnclosures(selectedFiles);
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 💡 UPDATE 1: Use FormData to send files and text
    const data = new FormData();
    
    // Append text fields
    Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
    });

    // 💡 UPDATE 2: Append each selected file using the field name 'enclosures'
    // This MUST match the name used in petitionRoutes.js (upload.array('enclosures', 5))
    enclosures.forEach(file => {
        data.append('enclosures', file);
    });

    try {
        // 💡 UPDATE 3: Send the FormData object. Axios/API client will automatically 
        // set the necessary 'multipart/form-data' header.
        const res = await api.post("/petitions/create", data); 

      if (res.status === 201) {
        toast.success("Petition created successfully!");
        navigate("/petitions");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Could not create petition.";
        // Optional: If Multer rejects a file, the message will be in err.response.data
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2D3E50] mb-6">
        Petition Creation
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6"
        // NOTE: The encoding type is not strictly needed for fetch/axios with FormData, 
        // but it's good practice for clarity in traditional forms.
      >
        <div className="flex items-center mb-6">
          <svg
            className="w-6 h-6 text-[#E84C3D] mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 20h9M12 4h9M4 9h16M4 15h16" />
          </svg>
          <h2 className="text-xl font-semibold text-[#2D3E50]">
            Create a New Petition
          </h2>
        </div>
        <p className="text-gray-600 mb-6">
          Complete the form below to create a petition in your community.
        </p>

        {/* Petition Title */}
        <div className="mb-4">
          <label
            className="block text-[#2D3E50] font-medium mb-1"
            htmlFor="title"
          >
            Petition Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Give your petition a clear, specific title"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E84C3D]"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Category & Location */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              className="block text-[#2D3E50] font-medium mb-1"
              htmlFor="category"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E84C3D]"
              value={formData.category}
              onChange={handleChange}
            >
              {PETITION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block text-[#2D3E50] font-medium mb-1"
              htmlFor="location"
            >
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E84C3D]"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Signature Goal */}
        <div className="mb-4">
          <label
            className="block text-[#2D3E50] font-medium mb-1"
            htmlFor="signatureGoal"
          >
            Signature Goal
          </label>
          <input
            id="signatureGoal"
            name="signatureGoal"
            type="number"
            min="1"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E84C3D]"
            value={formData.signatureGoal}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label
            className="block text-[#2D3E50] font-medium mb-1"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            placeholder="Describe the issue and the change you'd like to see..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E84C3D]"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        
        {/* 💡 NEW: Enclosure Upload Field */}
        <div className="mb-6">
            <label
              className="block text-[#2D3E50] font-medium mb-1"
              htmlFor="enclosures"
            >
              Supporting Files (Images/Documents)
            </label>
            <input
              id="enclosures"
              name="enclosures"
              type="file"
              multiple // Allows multiple file selection
              accept="image/*, application/pdf, .doc, .docx" // Suggested file types
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-[#2D3E50] hover:file:bg-gray-200"
            />
            {enclosures.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                    {enclosures.length} file(s) selected. Max 5 allowed.
                </p>
            )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[#E84C3D] text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300 disabled:bg-gray-400"
        >
          {isSubmitting ? "Submitting..." : "Create Petition"}
        </button>
      </form>
    </div>
  );
};

export default CreatePetition;