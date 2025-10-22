import { useState } from 'react';
import { useAuth } from '/src/context/AuthContext.jsx';

const CreatePollModal = ({ isOpen, onClose, onPollCreated, cities, API_URL }) => {
    const { token } = useAuth();
    const initialState = { question: '', description: '', options: ['', ''], location: 'All locations', date: '' };
    const [formData, setFormData] = useState(initialState);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        if (formData.options.length < 5) {
            setFormData({ ...formData, options: [...formData.options, ''] });
        }
    };

    const removeOption = (index) => {
        if (formData.options.length > 2) {
            setFormData({ ...formData, options: formData.options.filter((_, i) => i !== index) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.question || formData.options.some(opt => !opt.trim())) {
            setError('Please provide a question and fill all option fields.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/polls`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({
                    title: formData.question,
                    options: formData.options.filter(opt => opt.trim()),
                    targetLocation: formData.location,
                    description: formData.description || '',
                    closedAt: formData.date || ''
                }),
            });

            const text = await response.text();
            let data;
            try { data = JSON.parse(text); } 
            catch { throw new Error(text || 'Server returned an invalid response'); }

            if (!response.ok) throw new Error(data.msg || 'Failed to create poll.');

            onPollCreated(data);
            setFormData(initialState);
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-xs z-50 flex justify-center items-center p-4">
            <div className="relative bg-white border-gray-400 border-1 rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-full overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 px-2 pb-1 transition text-gray-400 hover:text-white rounded-md hover:bg-red-600 text-3xl font-light">&times;</button>
                <div className="flex items-center mb-1">
                    <div className="bg-blue-100 text-blue-600 rounded-lg p-3 ">
                        <i className="fa-solid fa-square-poll-vertical fa-lg"></i>
                    </div>
                    <h2 className="text-2xl font-bold ml-4">Create a New Poll</h2>
                </div>
                <p className="text-gray-600 mb-4">Create a poll to get public sentiment on local issues.</p>
                {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-3">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="question" className="block text-sm font-bold text-gray-700 mb-2">Poll Question</label>
                        <input type="text" name="question" id="question" value={formData.question} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Keep your question clear and specific" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Poll Options</label>
                        <p className="text-xs text-gray-500 mb-3">Add at least 2 options, up to a maximum of 5.</p>
                        {formData.options.map((option, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <input type="text" value={option} onChange={(e) => handleOptionChange(index, e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" placeholder={`Option ${index + 1}`} />
                                {formData.options.length > 2 && <button type="button" onClick={() => removeOption(index)} className="ml-2 px-2 text-red-500 hover:bg-red-500 hover:text-white transition rounded-xs text-2xl font-light cursor-pointer">&times;</button>}
                            </div>
                        ))}
                        {formData.options.length < 5 && <button type="button" onClick={addOption} className="text-blue-600 font-semibold text-sm cursor-pointer">+ Add Option</button>}
                    </div>
                    <div className='flex flex-col sm:flex-row justify-between'>
                        <div className='min-w-40 sm:w-60' >
                            <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-2">Target Location</label>
                            <select name="location" id="location" value={formData.location} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                                {cities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div className="min-w-40 sm:w-60">
                            <label htmlFor="date" className="block text-sm font-bold text-gray-700 mb-2">
                                Closes On
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Give community members enough information to make an informed choice."></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-bold transition duration-300">Create Poll</button>
                </form>
            </div>
        </div>
    );
};

export default CreatePollModal;