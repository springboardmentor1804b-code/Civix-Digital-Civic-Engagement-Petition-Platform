import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Send
} from 'lucide-react';
import feedbackService from '../../services/feedbackService';

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadFeedbacks();
  }, [statusFilter]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await feedbackService.getAllFeedback(params);
      if (response.success) {
        setFeedbacks(response.feedbacks);
      }
    } catch (error) {
      console.error('Load feedbacks error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      const response = await feedbackService.updateFeedbackStatus(feedbackId, {
        status: newStatus
      });
      if (response.success) {
        loadFeedbacks();
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleRespond = async (feedbackId) => {
    if (!responseMessage.trim()) {
      alert('Please enter a response message');
      return;
    }

    try {
      const response = await feedbackService.respondToFeedback(
        feedbackId,
        responseMessage
      );
      if (response.success) {
        setResponseMessage('');
        setSelectedFeedback(null);
        loadFeedbacks();
        alert('Response sent successfully!');
      }
    } catch (error) {
      alert('Failed to send response');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={16} />;
      case 'reviewing': return <AlertCircle className="text-blue-500" size={16} />;
      case 'resolved': return <CheckCircle className="text-green-500" size={16} />;
      case 'closed': return <XCircle className="text-gray-500" size={16} />;
      default: return <MessageSquare className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Feedback Management
        </h1>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'reviewing', 'resolved', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Feedbacks List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback._id}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(feedback.status)}
                      <span className="font-semibold capitalize">
                        {feedback.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        • {feedback.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {feedback.subject}
                    </h3>
                    <p className="text-gray-600 mt-2">{feedback.message}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      From: {feedback.user?.name || 'Unknown'} ({feedback.user?.email})
                    </p>
                  </div>
                </div>

                {/* Status Change Buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handleStatusChange(feedback._id, 'pending')}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm"
                  >
                    Set Pending
                  </button>
                  <button
                    onClick={() => handleStatusChange(feedback._id, 'reviewing')}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                  >
                    Set Reviewing
                  </button>
                  <button
                    onClick={() => handleStatusChange(feedback._id, 'closed')}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm"
                  >
                    Close
                  </button>
                </div>

                {/* Response Section */}
                {selectedFeedback === feedback._id ? (
                  <div className="border-t pt-4">
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="w-full border rounded-lg p-3 mb-2"
                      rows="3"
                      placeholder="Type your response..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(feedback._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Send size={16} className="inline mr-2" />
                        Send Response
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFeedback(null);
                          setResponseMessage('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : feedback.response ? (
                  <div className="border-t pt-4 bg-green-50 p-3 rounded">
                    <p className="font-medium text-green-900 mb-1">
                      Admin Response:
                    </p>
                    <p className="text-green-800">{feedback.response.message}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedFeedback(feedback._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Respond to Feedback
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;