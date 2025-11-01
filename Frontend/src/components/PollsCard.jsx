import { useState } from "react";
<<<<<<< HEAD
import { update } from "../axios/poll";
import { Pie } from "react-chartjs-2";
import { updateClose } from '../axios/poll';
=======
import { update, updateClose } from "../axios/poll";
import { Pie } from "react-chartjs-2";
import { FaEdit, FaTrash, FaLock, FaUnlock, FaChartBar, FaEye } from "react-icons/fa";
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Link } from "react-router-dom";
<<<<<<< HEAD
=======
import { Bounce, toast } from "react-toastify";
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export const PollsCard = ({ poll, currentUserId, getPolls, data, handleDelete }) => {
  const [options, setOptions] = useState(poll.options);
  const [showDescription, setShowDescription] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleVote = async (index) => {
    const updatedOptions = options.map((opt, i) => {
      const hasVoted = opt.votes.includes(currentUserId);

      if (i === index) {
<<<<<<< HEAD
        if (hasVoted) {
          return {
            ...opt,
            votes: opt.votes.filter((id) => id !== currentUserId),
          };
        } else {
          return {
            ...opt,
            votes: [...opt.votes, currentUserId],
          };
        }
      }

      if (!poll.allowMultiple && opt.votes.includes(currentUserId)) {
        return {
          ...opt,
          votes: opt.votes.filter((id) => id !== currentUserId),
        };
=======
        return hasVoted
          ? { ...opt, votes: opt.votes.filter((id) => id !== currentUserId) }
          : { ...opt, votes: [...opt.votes, currentUserId] };
      }

      if (!poll.allowMultiple && opt.votes.includes(currentUserId)) {
        return { ...opt, votes: opt.votes.filter((id) => id !== currentUserId) };
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
      }

      return opt;
    });

    const response = await update({ id: poll._id, options: updatedOptions });
<<<<<<< HEAD
    if (!response.found) {

      return;
    }
    setOptions(updatedOptions);
  };


=======
    if (!response.found) return;
    setOptions(updatedOptions);
  };

>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
  const pieData = {
    labels: options.map((opt) => opt.text),
    datasets: [
      {
        data: options.map((opt) => opt.votes.length),
        backgroundColor: [
<<<<<<< HEAD
          "#3b82f6",
          "#ef4444",
          "#f59e0b",
          "#10b981",
          "#8b5cf6",
          "#ec4899",
          "#f43f5e",
=======
          "#8B4513", 
          "#D2B48C", 
          "#C19A6B", 
          "#A0522D", 
          "#D2691E", 
          "#CD853F", 
          "#E9967A", 
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
        ],
        borderWidth: 1,
      },
    ],
  };

<<<<<<< HEAD
  const handleClose = async (id, isClose) => {
    const res = await updateClose(id, !poll.isClosed)
    if (res.found) {
      await getPolls();
      return;
    } else {
      toast.error(res.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      return;
    }
  }

  return (
    <div className="bg-[#0f172a] p-6 rounded-xl shadow-xl text-white mb-6 w-full border border-gray-700 hover:shadow-2xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <h2 className="text-2xl font-bold text-white">{poll.title}</h2>
        <p className="text-sm text-gray-400 mt-1 sm:mt-0">
          <span className="text-blue-400">{poll.category}</span> • {poll.location}
        </p>
      </div>

=======
  const handleClose = async (id) => {
    const res = await updateClose(id, !poll.isClosed);
    if (res.found) {
      await getPolls();
    } else {
      toast.error(res.message, {
        position: "top-right",
        theme: "dark",
        transition: Bounce,
      });
    }
  };

  return (
    <div className="bg-[#fdf3e7] p-6 rounded-xl shadow-md text-[#2e2e2e] mb-6 w-full border border-[#d4b998] hover:shadow-lg transition-all duration-300">

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <h2 className="text-2xl font-bold text-[#5A3E1B]">{poll.title}</h2>
        <p className="text-sm text-[#7a6b5a] mt-1 sm:mt-0">
          <span className="text-[#A67C52] font-semibold">{poll.category}</span> • {poll.location}
        </p>
      </div>


>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
      <div className="flex flex-col gap-3 mt-3">
        {options.map((opt, i) => {
          const hasVoted = opt.votes.includes(currentUserId);
          const totalVotes = options.reduce((a, b) => a + b.votes.length, 0);
          const percent =
            totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100);

          return (
            <button
<<<<<<< HEAD
              disabled={poll.isClosed}
              key={i}
              onClick={() => handleVote(i)}
              className={`relative group text-left w-full p-3 rounded-lg border transition-all duration-300 overflow-hidden ${hasVoted
                ? "border-blue-500 bg-gradient-to-r from-blue-600/20 to-blue-500/10"
                : "border-gray-700 hover:border-blue-500 hover:bg-blue-600/10"
                }  ${poll.isClosed ? "cursor-not-allowed opacity-40" : "cursor-pointer opacity-100"}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-base">{opt.text}</span>
                <span className="text-xs text-gray-400">{opt.votes.length} votes</span>
              </div>

              <div className="w-full bg-gray-800 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
=======
              key={i}
              disabled={poll.isClosed}
              onClick={() => handleVote(i)}
              className={`relative text-left w-full p-3 rounded-lg border transition-all duration-300 overflow-hidden ${
                hasVoted
                  ? "border-[#5A3E1B] bg-[#5A3E1B] text-white"
                  : "border-[#A67C52] bg-white text-[#2e2e2e] hover:bg-[#A67C52] hover:text-white"
              } ${poll.isClosed ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-base">{opt.text}</span>
                <span className="text-xs">{opt.votes.length} votes</span>
              </div>

              <div className="w-full bg-[#e6d7c3] rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#5A3E1B] to-[#A67C52] h-2 rounded-full transition-all duration-500"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
                  style={{ width: `${percent}%` }}
                ></div>
              </div>

<<<<<<< HEAD
              <span className="absolute right-2 bottom-2 text-[10px] text-white">
=======
              <span className="absolute right-2 bottom-2 text-[10px] text-[#5A3E1B]">
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
                {percent}%
              </span>
            </button>
          );
        })}
<<<<<<< HEAD
        {poll.allowMultiple && (
          <p className="text-gray-400 text-md">
            <span className="text-red-600">*</span>Can Vote Multiple Answers
=======

        {poll.allowMultiple && (
          <p className="text-sm mt-2 text-[#7a6b5a]">
            <span className="text-[#A67C52]">*</span> Can vote multiple answers
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
          </p>
        )}
      </div>

<<<<<<< HEAD
      <div className="mt-5 flex items-center gap-2 justify-between flex-wrap">
        <button
          onClick={() => setShowDescription((prev) => !prev)}
          className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-all"
        >
          {showDescription ? "Hide Description ▲" : "View Description ▼"}
        </button>

        <button
          onClick={() => setShowReport(true)}
          className="text-white text-sm font-medium hover:text-[#067704] transition-all rounded-md bg-[#067704] hover:bg-white px-4 py-2 cursor-pointer"
        >
          View Report
        </button>

        {data._id === poll.created_user_id && (
          <div className="flex gap-2 items-center">
            <Link to={poll.isClosed ? "#" : "/home/polls/form"}
              disabled={poll.isClosed}
              state={
                {
                  id: poll._id,
                  title: poll.title,
                  description: poll.description,
                  options: poll.options.map((cur) => cur.text),
                  category: poll.category,
                  location: poll.location,
                  allowMultiple: poll.allowMultiple,
                  isClosed: poll.isClosed
                }
              }
              className={`bg-orange-500 py-2 w-15 text-center rounded-md hover:bg-orange-400 ${poll.isClosed ? "cursor-not-allowed opacity-40" : "cursor-pointer opacity-100"}`}>Edit</Link>
            <button
              onClick={() => handleDelete(poll)}
              disabled={poll.isClosed}
              className={`bg-red-600 text-white py-2 rounded-lg text-md hover:bg-red-500 transition w-15 ${poll.isClosed ? "cursor-not-allowed opacity-40" : "cursor-pointer opacity-100"}`}
            >
              Delete
            </button>
            <button className={`${poll.isClosed ? "bg-green-700 hover:bg-green-500" : "bg-orange-600 hover:bg-red-500"} text-white py-2 rounded-lg text-md transition cursor-pointer w-20`} onClick={() => handleClose(poll._id)}>
              {poll.isClosed ? "Open Poll" : "Close Poll"}
=======
      <div className="mt-5 flex items-center gap-4 justify-between flex-wrap">
        <button
          onClick={() => setShowDescription((prev) => !prev)}
          title="View Description"
          className="text-[#A67C52] text-xl hover:text-[#5A3E1B] transition"
        >
          <FaEye />
        </button>

        <button
          onClick={() => {
            getPolls();
            setShowReport(true);
          }}
          title="View Report"
          className="text-green-700 text-2xl hover:text-green-600 transition"
        >
          <FaChartBar />
        </button>

        {data._id === poll.created_user_id && (
          <div className="flex gap-4 items-center">
            <Link
              to={poll.isClosed ? "#" : "/home/polls/form"}
              disabled={poll.isClosed}
              state={{
                id: poll._id,
                title: poll.title,
                description: poll.description,
                options: poll.options.map((cur) => cur.text),
                category: poll.category,
                location: poll.location,
                allowMultiple: poll.allowMultiple,
                isClosed: poll.isClosed,
              }}
              title="Edit Poll"
              className={`text-[#A67C52] text-xl hover:text-[#5A3E1B] transition ${
                poll.isClosed ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
            >
              <FaEdit />
            </Link>

            <button
              onClick={() => handleDelete(poll)}
              disabled={poll.isClosed}
              title="Delete Poll"
              className={`text-red-600 text-xl hover:text-red-500 transition ${
                poll.isClosed ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
            >
              <FaTrash />
            </button>


            <button
              onClick={() => handleClose(poll._id)}
              title={poll.isClosed ? "Open Poll" : "Close Poll"}
              className={`text-xl transition ${
                poll.isClosed
                  ? "text-[#FF0000] hover:text-[#DAA520]"
                  : "text-[#008000] hover:text-[#00A000]" 
              }`}
            >
              {poll.isClosed ? <FaUnlock /> : <FaLock />}
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            </button>
          </div>
        )}
      </div>

<<<<<<< HEAD
      {showDescription && (
        <p className="mt-3 text-gray-300 text-sm leading-relaxed border-t border-gray-700 pt-3 w-full break-all cursor-pointer">
=======
 
      {showDescription && (
        <p className="mt-3 text-[#7a6b5a] text-sm leading-relaxed border-t border-[#d4b998] pt-3 w-full break-all">
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
          {poll.description}
        </p>
      )}


      {showReport && (
<<<<<<< HEAD
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
=======
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
          <div
            onClick={() => setShowReport(false)}
            className="flex justify-center items-center w-full h-full"
          >
            <div
              onClick={(e) => e.stopPropagation()}
<<<<<<< HEAD
              className="bg-[#1e293b] p-6 rounded-xl w-11/12  max-w-md shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Poll Report</h3>
                <button
                  onClick={() => setShowReport(false)}
                  className="text-white text-lg font-bold cursor-pointer"
=======
              className="bg-[#fffdf8] p-6 rounded-xl w-11/12 max-w-md shadow-lg border border-[#d4b998]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#5A3E1B]">Poll Report</h3>
                <button
                  onClick={() => setShowReport(false)}
                  className="text-[#A67C52] text-lg font-bold"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
                >
                  ✕
                </button>
              </div>

<<<<<<< HEAD
              <h3 className="text-lg font-semibold text-white mb-3">{poll.title}</h3>
              <div className="flex gap-8 flex-wrap items-center w-full">
                <div className="flex justify-center">
                  <div className="w-58 h-58">
                    {poll.options.map((curPoll)=> {return curPoll.votes.length !== 0}).includes(true) && <Pie
                      data={pieData}
                      options={{
                        plugins: {
                          legend: { labels: { color: "white", font: { size: 12 } } },
                        },
                        maintainAspectRatio: false,
                      }}
                    />}
                    {!poll.options.map((curPoll)=> {return curPoll.votes.length !== 0}).includes(true) && <h3 className="text-red-600 text-2xl align-center h-58 w-58 text-center">Not Data</h3>}
                  </div>
                </div>

                <ul className="mt-4 text-white text-sm">
                  {options.map((opt, i) => (
                    <li key={i} className="flex justify-between mb-1 gap-3">
                      <span className="text-green-600">{opt.text}</span>
=======
              <h3 className="text-lg font-semibold text-[#2e2e2e] mb-3">
                {poll.title}
              </h3>

              <div className="flex gap-8 flex-wrap items-center w-full">
                <div className="flex justify-center w-full">
                  <div className="w-60 h-60">
                    {options.some((o) => o.votes.length !== 0) ? (
                      <Pie
                        data={pieData}
                        options={{
                          plugins: {
                            legend: { labels: { color: "#333", font: { size: 12 } } },
                          },
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <h3 className="text-[#A67C52] text-center text-lg">No Data</h3>
                    )}
                  </div>
                </div>

                <ul className="mt-4 text-[#2e2e2e] text-sm w-full">
                  {options.map((opt, i) => (
                    <li key={i} className="flex justify-between mb-1">
                      <span className="text-[#5A3E1B] font-medium">{opt.text}</span>
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
                      <span>{opt.votes.length} votes</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
      )}
    </div>
  );
};
<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
