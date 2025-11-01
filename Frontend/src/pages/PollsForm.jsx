import { useState } from "react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { AiOutlineWarning } from "react-icons/ai";
<<<<<<< HEAD
import { Link, useNavigate , useLocation } from "react-router-dom";
=======
import { Link, useNavigate, useLocation } from "react-router-dom";
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
import { toast, Bounce } from "react-toastify";
import { add } from "../axios/poll";

export const PollsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pollFromsData = location.state;
<<<<<<< HEAD
  //console.log(pollFromsData);

  const [pollData, setPollData] = useState(pollFromsData || {
    title: "",
    description: "",
    options: ["", ""],
    category: "General",
    location: "Telangana",
    allowMultiple: false,
  });

  const [errors, setErrors] = useState({});


=======

  const [pollData, setPollData] = useState(
    pollFromsData || {
      title: "",
      description: "",
      options: ["", ""],
      category: "General",
      location: "Telangana",
      allowMultiple: false,
    }
  );

  const [errors, setErrors] = useState({});

>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
  const handleChange = (field, value) => {
    setPollData((prev) => ({ ...prev, [field]: value }));
  };

<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
  const handleOptionChange = (index, value) => {
    const newOptions = [...pollData.options];
    newOptions[index] = value;
    setPollData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleAddOption = () => {
    if (pollData.options[0].trim() && pollData.options[1].trim()) {
      setPollData((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }));
    } else {
      toast.warning("Please fill the first two options before adding more.", {
<<<<<<< HEAD
        theme: "dark",
=======
        theme: "colored",
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
        transition: Bounce,
      });
    }
  };

  const handleRemoveOption = (index) => {
    if (pollData.options.length > 2) {
      setPollData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
  const handleClear = () => {
    setPollData({
      title: "",
      description: "",
      options: ["", ""],
      category: "General",
      location: "Telangana",
      allowMultiple: false,
    });
    setErrors({});
  };

<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!pollData.title.trim()) newErrors.title = "Poll title is required.";
    if (pollData.options.some((opt) => !opt.trim()))
      newErrors.options = "Please fill in all poll options.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const formattedPoll = {
      ...pollData,
      options: pollData.options.filter((opt) => opt.trim() !== ""),
    };

<<<<<<< HEAD
    // console.log(formattedPoll)
=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    const response = await add({ ...formattedPoll });

    if (response.found) {
      toast.success(response.message, {
        position: "top-right",
        autoClose: 3000,
<<<<<<< HEAD
        theme: "dark",
=======
        theme: "colored",
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
        transition: Bounce,
      });
    } else {
      toast.error(response.message, {
        position: "top-right",
        autoClose: 3000,
<<<<<<< HEAD
        theme: "dark",
=======
        theme: "colored",
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
        transition: Bounce,
      });
    }

    handleClear();
  };

  return (
<<<<<<< HEAD
    <div className="flex flex-col min-h-screen gap-5  text-white">

      <Link
        to="/home/polls"
        className="p-2 text-white bg-[#2563eb] rounded-md w-max hover:bg-[#1e40af] transition"
      >
        <FaArrowLeft className="inline-block mr-2" />
        Back to Polls
      </Link>


      <div className="bg-[#0f172a] p-4 md:p-6 rounded-md shadow-md border border-[#1e293b] flex flex-col gap-5">
        <h1 className="text-2xl md:text-4xl font-extrabold text-center">
          Create a Poll
        </h1>
        <p className="text-gray-300 text-center mb-4">
          Complete the form below to create a poll and engage your community
=======
    <div className="flex flex-col min-h-screen gap-5 bg-gradient-to-b from-[#F5E6C5] to-[#E8D3A8] text-[#3E2B1D] px-4 py-6">


      <Link
        to="/home/polls"
        className="p-2 text-white bg-[#C38E56] rounded-md w-max hover:bg-[#D9A66E] hover:scale-105 transition flex items-center gap-2 shadow-md"
      >
        <FaArrowLeft />
        Back to Polls
      </Link>

      <div className="bg-[#FFF7E8] p-5 md:p-7 rounded-lg shadow-xl border border-[#E2C391] flex flex-col gap-5">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-[#7A4A1F]">
          Create a Poll
        </h1>
        <p className="text-center text-[#8C5A2F]/80 mb-4">
          Fill out the form below to create a poll and engage your community.
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

<<<<<<< HEAD
          <div>
            <label className="font-bold block mb-1 text-white">
=======

          <div>
            <label className="font-semibold block mb-1 text-[#7A4A1F]">
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
              Poll Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={pollData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter your poll question"
<<<<<<< HEAD
              className={`w-full p-2 rounded-md border ${errors.title ? "border-red-500" : "border-[#2563eb]"
                } bg-[#1e293b] text-white`}
=======
              className={`w-full p-2 rounded-md border ${
                errors.title ? "border-red-500" : "border-[#C9A66B]"
              } bg-[#FFF3DB] text-[#3E2B1D] focus:outline-none focus:ring-2 focus:ring-[#C9A66B]`}
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>


          <div>
<<<<<<< HEAD
            <label className="font-bold block mb-1 text-white">Description</label>
=======
            <label className="font-semibold block mb-1 text-[#7A4A1F]">
              Description
            </label>
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            <textarea
              rows="3"
              value={pollData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Explain what your poll is about"
<<<<<<< HEAD
              className="w-full p-2 rounded-md border border-[#2563eb] bg-[#1e293b] text-white"
=======
              className="w-full p-2 rounded-md border border-[#C9A66B] bg-[#FFF3DB] text-[#3E2B1D] focus:ring-2 focus:ring-[#C9A66B]"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            />
          </div>


          <div>
<<<<<<< HEAD
            <label className="font-bold block mb-2 text-white">
=======
            <label className="font-semibold block mb-2 text-[#7A4A1F]">
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
              Poll Options <span className="text-red-600">*</span>
            </label>

            {pollData.options.map((option, index) => (
              <div
                key={index}
<<<<<<< HEAD
                className="flex items-center gap-3 mb-2 bg-[#1e293b]/40 p-2 rounded-md"
=======
                className="flex items-center gap-3 mb-2 bg-[#FDF0D3] p-2 rounded-md border border-[#E0C28A]"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
              >
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
<<<<<<< HEAD
                  className={`flex-1 p-2 rounded-md border ${errors.options ? "border-red-500" : "border-[#2563eb]"
                    } bg-[#1e293b] text-white`}
                />

=======
                  className={`flex-1 p-2 rounded-md border ${
                    errors.options ? "border-red-500" : "border-[#C9A66B]"
                  } bg-[#FFF8E4] text-[#3E2B1D]`}
                />
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
                {index >= 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
<<<<<<< HEAD
                    className="text-red-500 hover:text-red-400 transition"
=======
                    className="text-red-600 hover:text-red-400 transition"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}

            {errors.options && (
              <p className="text-red-600 text-sm mt-1">{errors.options}</p>
            )}

<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleAddOption}
                disabled={!pollData.options[0].trim() || !pollData.options[1].trim()}
<<<<<<< HEAD
                className={`flex items-center gap-2 text-[#2563eb] hover:text-[#1e40af] transition ${!pollData.options[0].trim() || !pollData.options[1].trim()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                  }`}
              >
                <FaPlus /> Add More Options
              </button>
              <p className="text-gray-400 text-sm italic">
=======
                className={`flex items-center gap-2 text-[#8C5A2F] hover:text-[#A76D3D] transition ${
                  !pollData.options[0].trim() || !pollData.options[1].trim()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <FaPlus /> Add More Options
              </button>
              <p className="text-[#7A4A1F]/70 text-sm italic">
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
                You can add more options after filling the first two.
              </p>
            </div>

<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="allowMultiple"
                checked={pollData.allowMultiple}
                onChange={(e) => handleChange("allowMultiple", e.target.checked)}
<<<<<<< HEAD
                className="accent-[#2563eb] w-4 h-4"
              />
              <label
                htmlFor="allowMultiple"
                className="text-gray-300 text-sm cursor-pointer select-none"
=======
                className="accent-[#C9A66B] w-4 h-4"
              />
              <label
                htmlFor="allowMultiple"
                className="text-[#7A4A1F] text-sm cursor-pointer select-none"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
              >
                Allow users to select multiple answers
              </label>
            </div>
          </div>

<<<<<<< HEAD

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1 text-white">Category</label>
              <select
                value={pollData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full p-2 rounded-md border border-[#2563eb] bg-[#1e293b] text-white"
=======
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1 text-[#7A4A1F]">Category</label>
              <select
                value={pollData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full p-2 rounded-md border border-[#C9A66B] bg-[#FFF3DB] text-[#3E2B1D]"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
              >
                <option value="">Select a category</option>
                <option value="all">All</option>
                <option value="environment">Environment</option>
                <option value="education">Infrastructure</option>
                <option value="health">Education</option>
                <option value="rights">Public Safety</option>
                <option value="transportation">Transportation</option>
                <option value="healthcare">Health Care</option>
                <option value="housing">Housing</option>
              </select>
            </div>

            <div>
<<<<<<< HEAD
              <label className="font-bold block mb-1 text-white">Location</label>
              <select
                value={pollData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="w-full p-2 rounded-md border border-[#2563eb] bg-[#1e293b] text-white"
=======
              <label className="font-semibold block mb-1 text-[#7A4A1F]">Location</label>
              <select
                value={pollData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="w-full p-2 rounded-md border border-[#C9A66B] bg-[#FFF3DB] text-[#3E2B1D]"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
              >
                <option>Telangana</option>
                <option>Andhra Pradesh</option>
                <option>New Delhi</option>
                <option>Kerala</option>
                <option>Tamil Nadu</option>
              </select>
            </div>
          </div>


<<<<<<< HEAD
          <div className="bg-red-900/20 text-red-300 border border-red-700/50 p-3 rounded-md flex gap-3 items-start">
            <AiOutlineWarning className="w-6 h-6 text-red-500" />
            <div>
              <p className="font-bold mb-1 text-red-300 text-lg">
                Important Information
              </p>
              <p className="text-gray-300 text-md">
                By creating this poll, you confirm that it does not contain any
                offensive or misleading content.{" "}
=======
          <div className="bg-[#FBE8C7] text-[#7A4A1F] border border-[#E2C391] p-3 rounded-md flex gap-3 items-start">
            <AiOutlineWarning className="w-6 h-6 text-[#C38E56]" />
            <div>
              <p className="font-bold mb-1 text-[#8C5A2F] text-lg">
                Important Information
              </p>
              <p className="text-[#7A4A1F] text-md">
                By creating this poll, you confirm that it does not contain any offensive or misleading content.{" "}
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
                {pollData.allowMultiple
                  ? "Participants can select multiple answers."
                  : "Participants can select only one answer."}
              </p>
            </div>
          </div>


          <div className="flex flex-wrap gap-3 mt-2">
            <button
              type="submit"
<<<<<<< HEAD
              className="bg-[#2563eb] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#1e40af] transition"
=======
              className="bg-[#C38E56] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#D9A66E] transition"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            >
              Create Poll
            </button>
            <button
              type="button"
              onClick={handleClear}
<<<<<<< HEAD
              className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-500 transition"
=======
              className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-400 transition"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
