import { useState, useEffect } from "react";

const EditPoll = ({ isOpen, onClose, poll, handleEdit }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [options, setOptions] = useState([]);
    const [closedAt, setClosedAt] = useState("");

    useEffect(() => {
        if (poll) {
            setTitle(poll.title);
            setDescription(poll.description || "");
            setOptions(poll.options.map(opt => opt.optionText));
            setClosedAt(poll.closedAt?.split("T")[0]); // format for date input
        }
    }, [poll]);

    if (!isOpen) return null;

    const handleOptionChange = (index, value) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    };

    const addOption = () => {
        if (options.length < 5) {
            setOptions([...options, ""]);
        }
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const handleSave = async () => {

        const updatedOptions = options.map((optText) => {
            const existing = poll.options.find(o => o.optionText === optText);
            return existing
                ? { ...existing, optionText: optText } // preserve existing votes & id
                : { optionText: optText, votes: 0 };   // new option gets 0 votes
        });
        const updatedPoll = {
            ...poll,
            title,
            description,
            options: updatedOptions,
            closedAt,
        };
        await handleEdit(updatedPoll)
        onClose();
    };

    return (
        <div className="fixed inset-0 backdrop-blur-xs z-50 flex justify-center items-center p-4">
            <div className="relative bg-white border-black rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-full overflow-y-auto border-1">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Poll</h2>

                <label className="block mb-2 font-semibold text-sm">Title</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded-lg p-2 mb-3"
                />

                <label className="block mb-2 font-semibold text-sm">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded-lg p-2 mb-3"
                    rows={3}
                    placeholder="Give community members enough information to make an informed choice."
                />

                <label className="block mb-2 font-semibold text-sm">Options</label>
                <p className="text-xs text-gray-500 mb-3">Add at least 2 options, up to a maximum of 5.</p>

                {options.map((opt, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <input
                            value={opt}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="w-full border rounded-lg p-2"
                            placeholder={`Option ${index + 1}`}
                        />
                        {options.length > 2 && (
                            <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="ml-2 px-2 text-red-500 hover:bg-red-500 hover:text-white transition rounded-xs text-2xl font-light cursor-pointer">
                                &times;
                            </button>
                        )}
                    </div>
                ))}

                {options.length < 5 && (
                    <button
                        type="button"
                        onClick={addOption}
                        className="text-blue-600 font-semibold text-sm cursor-pointer mb-4"
                    >
                        + Add Option
                    </button>
                )}

                <label className="block mb-2 font-semibold text-sm">Closing Date</label>
                <input
                    type="date"
                    value={closedAt}
                    onChange={(e) => setClosedAt(e.target.value)}
                    className="w-full border rounded-lg p-2 mb-3"
                />

                <div className="flex justify-end space-x-3 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 font-semibold cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold cursor-pointer"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPoll;
