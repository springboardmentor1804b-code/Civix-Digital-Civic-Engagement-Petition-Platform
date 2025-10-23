import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import api from "../Utils/api";
import { Trash2, BarChart3 } from "lucide-react";

const CreatePoll = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [location, setLocation] = useState(user?.location || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    } else {
      toast.warn("You can add a maximum of 10 options.");
    }
  };

  const deleteOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    } else {
      toast.error("A poll must have at least 2 options.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate that all options have text
    if (options.some((opt) => opt.trim() === "")) {
      toast.error("Please fill out all poll options before submitting.");
      setIsSubmitting(false);
      return;
    }

    const pollData = {
      question,
      description,
      options: options.map((opt) => ({ text: opt })), // Structure for the backend
      location,
    };

    try {
      const res = await api.post("/polls/create", pollData);

      if (res.status === 201) {
        toast.success("Poll created successfully!");
        
        // Trigger dashboard refresh
        localStorage.setItem('pollCreated', Date.now().toString());
        window.dispatchEvent(new CustomEvent('contentCreated'));
        
        navigate("/polls");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Could not create poll.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-6 lg:max-w-4xl lg:mx-auto lg:px-0">
      <h1 className="flex items-center gap-2 text-3xl font-bold mb-6 text-[#2D3E50]">
        <BarChart3 className="w-8 h-8 text-[#E84C3D]" /> Poll Creation
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 space-y-6"
      >
        {/* Poll Question */}
        <div>
          <label
            className="block text-[#2D3E50] font-semibold mb-2"
            htmlFor="question"
          >
            Poll Question
          </label>
          <input
            type="text"
            id="question"
            name="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What do you want to ask the community?"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#E84C3D]"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label
            className="block text-[#2D3E50] font-semibold mb-2"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide more context about the poll..."
            className="w-full border rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-[#E84C3D]"
          />
        </div>

        {/* Poll Options */}
        <div>
          <label className="block text-[#2D3E50] font-semibold mb-2">
            Poll Options
          </label>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#E84C3D]"
                  required
                />
                <button
                  type="button"
                  onClick={() => deleteOption(idx)}
                  className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition"
                >
                  <Trash2 className="w-5 h-5 text-[#E84C3D]" />
                </button>
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 px-4 py-2 rounded-lg border border-[#E84C3D] text-[#E84C3D] hover:bg-[#E84C3D] hover:text-white transition"
            >
              + Add Option
            </button>
          )}
        </div>

        {/* Target Location */}
        <div>
          <label
            className="block text-[#2D3E50] font-semibold mb-2"
            htmlFor="location"
          >
            Target Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#E84C3D]"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-lg bg-[#E84C3D] text-white font-semibold hover:bg-[#2D3E50] transition disabled:bg-gray-400"
          >
            {isSubmitting ? "Creating..." : "Create Poll"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePoll;
