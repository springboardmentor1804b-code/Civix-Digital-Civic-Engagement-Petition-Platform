import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPoll, getPollById, editPoll } from "../../services/pollService";

const CreatePoll = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEditMode = Boolean(editId);
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    options: ["", ""],
    location: "",
    expiresAt: "",
    lat: null,
    lng: null
  });

  const [loadingLocation, setLoadingLocation] = useState(false);

  // Auto-detect location using Geolocation API
  useEffect(() => {
    const detectLocation = async () => {
      if (!navigator.geolocation) return;
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || '';
            const state = data.address.state || '';
            const country = data.address.country || '';
            setFormData(prev => ({
              ...prev,
              location: city && state ? `${city}, ${state}` : city && country ? `${city}, ${country}` : country || city,
              lat: latitude,
              lng: longitude
            }));
          }
        } catch (err) {
          console.error("Failed to detect location:", err);
        } finally {
          setLoadingLocation(false);
        }
      }, (err) => {
        console.warn("User denied location or error:", err);
        setLoadingLocation(false);
      });
    };
    detectLocation();
  }, []);

  // Initialize form: if editing, load poll; otherwise set default expiry
  useEffect(() => {
    const init = async () => {
      if (isEditMode) {
        try {
          const poll = await getPollById(editId);
          setFormData({
            question: poll.question || "",
            description: poll.description || "",
            options: Array.isArray(poll.options) && poll.options.length >= 2 ? poll.options : ["", ""],
            location: poll.location || "",
            expiresAt: poll.expiresAt ? new Date(poll.expiresAt).toISOString().split('T')[0] : "",
            lat: poll.lat ?? null,
            lng: poll.lng ?? null
          });
        } catch (e) {
          console.error("Failed to load poll for edit:", e);
          alert("Failed to load poll for editing");
          navigate('/dashboard/polls');
        }
      } else {
        const defaultExpiry = new Date();
        defaultExpiry.setDate(defaultExpiry.getDate() + 30);
        setFormData(prev => ({
          ...prev,
          expiresAt: defaultExpiry.toISOString().split('T')[0]
        }));
      }
    };
    init();
  }, [isEditMode, editId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validation
      if (!formData.location) {
        alert("Please enter a location");
        return;
      }
      
      const validOptions = formData.options.filter(opt => opt.trim() !== "");
      if (validOptions.length < 2) {
        alert("Please provide at least 2 poll options");
        return;
      }
      
      if (validOptions.length > 10) {
        alert("Maximum 10 poll options allowed");
        return;
      }

      const pollData = {
        ...formData,
        options: validOptions,
        // Ensure backend gets a valid ISO date string
        expiresAt: new Date(formData.expiresAt).toISOString()
      };

      if (isEditMode) {
        await editPoll(editId, pollData);
      } else {
        await createPoll(pollData);
      }
      navigate("/dashboard/polls");
    } catch (error) {
      console.error("Failed to create poll:", error);
      alert("Error creating poll");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData({
        ...formData,
        options: [...formData.options, ""]
      });
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        options: newOptions
      });
    }
  };

  // Calculate max date (30 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl ml-8 mr-4 px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Poll' : 'Create a New Poll'}</h1>
          <p className="text-gray-600 mt-1">{isEditMode ? 'Update your poll details.' : 'Create a poll to gather community feedback on local issues.'}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Poll Question */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Poll Question</h2>
              <p className="text-gray-500 text-sm mb-3">What do you want to ask the community?</p>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleChange}
                placeholder="Keep your question clear and specific."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-500 text-sm mb-3">Give community members enough information to make an informed choice.</p>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Provide more context about the poll..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                required
              />
            </div>

            {/* Poll Options */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Poll Options</h2>
              <p className="text-gray-500 text-sm mb-3">Add at least 2 options, up to a maximum of 10.</p>
              
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={index < 2}
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                
                {formData.options.length < 10 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span>+</span>
                    Add Option
                  </button>
                )}
              </div>
            </div>

            {/* Location and Expiry Date */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Target Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={loadingLocation ? "Detecting location..." : "The area this poll is relevant to"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">The area this poll is relevant to</p>
                </div>

                {/* Closes On */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Closes On</label>
                  <input
                    type="date"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleChange}
                    min={minDate}
                    max={maxDateString}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Choose when this poll will close (max 30 days)</p>
                </div>
              </div>
            </div>

            {/* Important Info */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-semibold text-yellow-800">Important Information:</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Polls should be designed to gather genuine community feedback on issues that affect your area. 
                    Polls that are misleading or designed to push a specific agenda may be removed.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard/polls')}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                {isEditMode ? 'Save Changes' : 'Create Poll'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePoll;