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
  const [formData, setFormData] = useState({
    title: "",
    category: PETITION_CATEGORIES[0],
    location: user?.location || "",
    signatureGoal: 100,
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // First create the petition
      const res = await api.post("/petitions/create", formData);

      if (res.status === 201) {
        const petitionId = res.data._id;
        
        // If there are files to upload, upload them
        if (selectedFiles.length > 0) {
          setUploadingFiles(true);
          const formDataFiles = new FormData();
          selectedFiles.forEach(file => {
            formDataFiles.append('files', file);
          });
          
          try {
            await api.post(`/petitions/${petitionId}/files`, formDataFiles, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          } catch (fileErr) {
            console.error('File upload error:', fileErr);
            toast.warning("Petition created but some files failed to upload.");
          }
          setUploadingFiles(false);
        }
        
        toast.success("Petition created successfully!");
        
        // Trigger dashboard refresh
        localStorage.setItem('petitionCreated', Date.now().toString());
        window.dispatchEvent(new CustomEvent('contentCreated'));
        
        navigate("/petitions");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Could not create petition.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-6 lg:max-w-4xl lg:mx-auto lg:px-0">
      <h1 className="text-2xl font-semibold text-[#2D3E50] mb-6">
        Petition Creation
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6"
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

        {/* Supporting Files */}
        <div className="mb-6">
          <label className="block text-[#2D3E50] font-medium mb-1">
            Supporting Files (Images/Documents)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              id="files"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="files"
              className="px-4 py-2 bg-gray-100 text-[#2D3E50] rounded-lg hover:bg-gray-200 cursor-pointer transition"
            >
              Choose files
            </label>
            <span className="text-sm text-gray-500">
              {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) chosen` : "No file chosen"}
            </span>
          </div>
          
          {/* Display selected files */}
          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || uploadingFiles}
          className="w-full py-3 bg-[#E84C3D] text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300 disabled:bg-gray-400"
        >
          {uploadingFiles ? "Uploading files..." : isSubmitting ? "Submitting..." : "Create Petition"}
        </button>
      </form>
    </div>
  );
};

export default CreatePetition;
