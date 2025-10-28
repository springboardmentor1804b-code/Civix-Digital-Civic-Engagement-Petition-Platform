import React, { useState, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Send, 
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Eye,
  Shield,
  RefreshCw
} from "lucide-react";
import {
  BugReport as BugReportIcon,
  Star as StarIcon,
  Help as HelpIcon,
  SentimentVeryDissatisfied as ComplaintIcon,
  Lightbulb as LightbulbIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import feedbackService from "../../services/feedbackService";
import { useAuth } from "../../hooks/useAuth";

const faqs = [
  {
    question: "How do I create a poll or petition in my area?",
    answer:
      "Tap the '+' button, choose poll/petition, fill the form, set your location, and publish. It goes live instantly for nearby citizens.",
  },
  {
    question: "Who can vote or sign my poll/petition?",
    answer:
      "Only users whose registered location is within the target radius you set (city, ward, or custom pin-drop).",
  },
  {
    question: "Can I edit or delete my poll/petition after publishing?",
    answer:
      "Yes—open the item → ⋮ menu → 'Edit' or 'Delete'. Editing resets the deadline; deleting removes all votes/signatures instantly.",
  },
  {
    question: "How are results verified and displayed?",
    answer:
      "Civix shows real-time counts, voter location heat-map, and raw percentages. Verified accounts are marked; duplicate votes are auto-removed.",
  },
  {
    question: "What happens when a petition reaches its signature goal?",
    answer:
      "The petition is flagged for official review. Public officials receive an alert and must respond publicly within the platform within 30 days.",
  },
  {
    question: "How do I update my profile picture?",
    answer:
      "Go to Settings → Profile tab → Click on your avatar → Upload a new photo (max 5MB, JPEG/PNG/GIF formats supported).",
  },
  {
    question: "Is my personal information secure?",
    answer:
      "Yes! We use industry-standard encryption and never share your data with third parties. Your location is only visible in aggregate statistics.",
  },
  {
    question: "How can I report inappropriate content?",
    answer:
      "Click the ⋮ menu on any poll/petition → 'Report' → Select reason. Our moderation team reviews all reports within 24 hours.",
  },
];

const categories = [
  { 
    value: 'bug', 
    label: 'Bug Report', 
    icon: BugReportIcon,
    color: 'text-red-600'
  },
  { 
    value: 'feature', 
    label: 'Feature Request', 
    icon: StarIcon,
    color: 'text-purple-600'
  },
  { 
    value: 'question', 
    label: 'Question', 
    icon: HelpIcon,
    color: 'text-blue-600'
  },
  { 
    value: 'complaint', 
    label: 'Complaint', 
    icon: ComplaintIcon,
    color: 'text-orange-600'
  },
  { 
    value: 'suggestion', 
    label: 'Suggestion', 
    icon: LightbulbIcon,
    color: 'text-yellow-600'
  },
  { 
    value: 'other', 
    label: 'Other', 
    icon: DescriptionIcon,
    color: 'text-gray-600'
  },
];

const HelpSupport = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('submit'); // 'submit', 'history', or 'all'
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'other'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  // Make useAuth safe - use try/catch or optional
  let user = null;
  let isAdmin = false;
  
  try {
    const auth = useAuth();
    user = auth?.user;
    isAdmin = user?.role === 'admin';
  } catch (error) {
    console.log('Auth context not available');
    // Fallback: try to get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user = JSON.parse(storedUser);
      isAdmin = user?.role === 'admin';
    }
  }

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Load feedback history
  const loadFeedbackHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await feedbackService.getUserFeedback();
      if (response.success) {
        setFeedbackHistory(response.feedbacks);
        setLastRefresh(Date.now());
      }
    } catch (err) {
      console.error('Load feedback history error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadAllFeedbacks = async () => {
    try {
      setLoadingAll(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await feedbackService.getAllFeedback(params);
      if (response.success) {
        setAllFeedbacks(response.feedbacks);
        setLastRefresh(Date.now());
      }
    } catch (err) {
      console.error('Load all feedbacks error:', err);
    } finally {
      setLoadingAll(false);
    }
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    if (activeTab === 'history') {
      loadFeedbackHistory();
    } else if (activeTab === 'all' && isAdmin) {
      loadAllFeedbacks();
    }
  };

  // Auto-refresh effect - runs every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      if (activeTab === 'history') {
        loadFeedbackHistory(); // For normal users
      } else if (activeTab === 'all' && isAdmin) {
        loadAllFeedbacks(); // For admin users
      }
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [activeTab, autoRefresh, isAdmin, statusFilter]);

  // Initial load on tab change
  useEffect(() => {
    if (activeTab === 'history') {
      loadFeedbackHistory();
    } else if (activeTab === 'all' && isAdmin) {
      loadAllFeedbacks();
    }
  }, [activeTab, statusFilter]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await feedbackService.submitFeedback(formData);
      
      if (response.success) {
        setSuccess(true);
        setFormData({
          subject: '',
          message: '',
          category: 'other'
        });
        
        // Show success message
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      const response = await feedbackService.deleteFeedback(feedbackId);
      if (response.success) {
        setFeedbackHistory(feedbackHistory.filter(f => f._id !== feedbackId));
        setSelectedFeedback(null);
      }
    } catch (err) {
      console.error('Failed to delete feedback:', err);
      setError('Failed to delete feedback. Please try again.');
    }
  };

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      const response = await feedbackService.updateFeedbackStatus(feedbackId, {
        status: newStatus
      });
      if (response.success) {
        loadAllFeedbacks();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };
  
  const handleRespond = async (feedbackId) => {
    if (!responseMessage.trim() || responseMessage.trim().length < 10) {
      alert('Response message must be at least 10 characters');
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
        loadAllFeedbacks();
        alert('Response sent successfully!');
      }
    } catch (err) {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryIcon = (categoryValue) => {
    const category = categories.find(c => c.value === categoryValue);
    if (!category) return null;
    const IconComponent = category.icon;
    return <IconComponent className={category.color} sx={{ fontSize: 16 }} />;
  };

  const getTimeSinceRefresh = () => {
    const seconds = Math.floor((Date.now() - lastRefresh) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto lg:ml-8 lg:mr-4 px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        
        {/* Header Section */}
        <div className="mb-8 text-center sm:text-left mt-[70px] sm:mt-0">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-2">Help & Support</h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Got a question, suggestion, or issue? We're here to help!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'submit'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Send className="inline mr-2" size={18} />
            Submit Feedback
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="inline mr-2" size={18} />
            My Feedback
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="inline mr-2" size={18} />
              All Feedback (Admin)
            </button>
          )}
        </div>

        {/* Submit Feedback Tab */}
        {activeTab === 'submit' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feedback Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Send className="text-blue-600" size={24} />
                  Send us your feedback
                </h2>

                {/* Success Message */}
                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-medium text-green-900">Thank you for your feedback!</p>
                      <p className="text-sm text-green-700 mt-1">We'll review it and get back to you soon.</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {categories.map((cat) => {
                        const IconComponent = cat.icon;
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat.value })}
                            className={`p-3 rounded-lg border-2 transition-all text-sm font-medium flex items-center justify-center gap-2 ${
                              formData.category === cat.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <IconComponent 
                              className={formData.category === cat.value ? 'text-blue-600' : cat.color} 
                              sx={{ fontSize: 20 }} 
                            />
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief summary of your feedback"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Describe your feedback in detail..."
                      rows="6"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 10 characters ({formData.message.length}/10)
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={loading || formData.message.length < 10}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Feedback
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* FAQ Section - Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Help</h3>
                <div className="space-y-3">
                  {faqs.slice(0, 4).map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                      <button
                        onClick={() => toggleFAQ(index)}
                        className="flex justify-between items-start w-full text-left gap-2"
                      >
                        <span className="font-medium text-gray-800 text-sm flex-1">
                          {faq.question}
                        </span>
                        {openIndex === index ? (
                          <ChevronUp className="text-blue-600 flex-shrink-0" size={18} />
                        ) : (
                          <ChevronDown className="text-blue-600 flex-shrink-0" size={18} />
                        )}
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          openIndex === index ? "max-h-96 mt-2" : "max-h-0"
                        }`}
                      >
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2 text-sm">Need urgent help?</h4>
                  <div className="space-y-2 text-blue-800 text-xs">
                    <div className="flex items-center gap-2">
                      <EmailIcon sx={{ fontSize: 16 }} className="text-blue-600" />
                      <span>support@civix.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneIcon sx={{ fontSize: 16 }} className="text-blue-600" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ScheduleIcon sx={{ fontSize: 16 }} className="text-blue-600" />
                      <span>Mon-Fri, 9AM-6PM EST</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Feedback History</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Auto-refresh
                    </label>
                    <span className="text-xs text-gray-400">
                      {getTimeSinceRefresh()}
                    </span>
                  </div>
                  <button
                    onClick={handleManualRefresh}
                    disabled={loadingHistory}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors flex items-center gap-2"
                    title="Refresh"
                  >
                    <RefreshCw 
                      size={16} 
                      className={loadingHistory ? 'animate-spin' : ''} 
                    />
                    Refresh
                  </button>
                </div>
              </div>

              {loadingHistory ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : feedbackHistory.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">No feedback submitted yet</p>
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Submit your first feedback →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbackHistory.map((feedback) => (
                    <div
                      key={feedback._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(feedback.status)}`}>
                              {getStatusIcon(feedback.status)}
                              <span className="capitalize">{feedback.status}</span>
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
                              {getCategoryIcon(feedback.category)} 
                              <span className="capitalize">{feedback.category}</span>
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900">{feedback.subject}</h3>
                          <p className="text-sm text-gray-600 mt-1">{feedback.message}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => setSelectedFeedback(selectedFeedback === feedback._id ? null : feedback._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteFeedback(feedback._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Response Section */}
                      {selectedFeedback === feedback._id && feedback.response && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                            <div className="flex-1">
                              <p className="font-medium text-blue-900 mb-1">Admin Response</p>
                              <p className="text-sm text-blue-800">{feedback.response.message}</p>
                              <p className="text-xs text-blue-600 mt-2">
                                Responded on {new Date(feedback.response.respondedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Submitted {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Feedback Tab (Admin Only) */}
        {activeTab === 'all' && isAdmin && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  All User Feedback (Admin Panel)
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Auto-refresh
                    </label>
                    <span className="text-xs text-gray-400">
                      {getTimeSinceRefresh()}
                    </span>
                  </div>
                  <button
                    onClick={handleManualRefresh}
                    disabled={loadingAll}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors flex items-center gap-2"
                    title="Refresh"
                  >
                    <RefreshCw 
                      size={16} 
                      className={loadingAll ? 'animate-spin' : ''} 
                    />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {['all', 'pending', 'reviewing', 'resolved', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {loadingAll ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : allFeedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">No feedback found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allFeedbacks.map((feedback) => (
                    <div
                      key={feedback._id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(feedback.status)}`}>
                              {getStatusIcon(feedback.status)}
                              <span className="capitalize">{feedback.status}</span>
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
                              {getCategoryIcon(feedback.category)} 
                              <span className="capitalize">{feedback.category}</span>
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {feedback.subject}
                          </h3>
                          <p className="text-gray-600 mb-3">{feedback.message}</p>
                          <p className="text-sm text-gray-500">
                            From: <span className="font-medium">{feedback.user?.name || 'Unknown'}</span> ({feedback.user?.email})
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Submitted {new Date(feedback.createdAt).toLocaleDateString()} at {new Date(feedback.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {/* Status Change Buttons */}
                      <div className="flex gap-2 mb-4 flex-wrap">
                        <button
                          onClick={() => handleStatusChange(feedback._id, 'pending')}
                          disabled={feedback.status === 'pending'}
                          className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Set Pending
                        </button>
                        <button
                          onClick={() => handleStatusChange(feedback._id, 'reviewing')}
                          disabled={feedback.status === 'reviewing'}
                          className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Set Reviewing
                        </button>
                        <button
                          onClick={() => handleStatusChange(feedback._id, 'closed')}
                          disabled={feedback.status === 'closed'}
                          className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Close
                        </button>
                      </div>

                      {/* Response Section */}
                      {selectedFeedback === feedback._id ? (
                        <div className="border-t pt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Admin Response
                          </label>
                          <textarea
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                            placeholder="Type your response (min 10 characters)..."
                          />
                          <p className="text-xs text-gray-500 mb-3">
                            {responseMessage.length}/10 characters minimum
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRespond(feedback._id)}
                              disabled={responseMessage.trim().length < 10}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
                            >
                              <Send size={16} />
                              Send Response
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFeedback(null);
                                setResponseMessage('');
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : feedback.response ? (
                        <div className="border-t pt-4 bg-green-50 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                            <div className="flex-1">
                              <p className="font-medium text-green-900 mb-1">Admin Response</p>
                              <p className="text-green-800 mb-2">{feedback.response.message}</p>
                              <p className="text-xs text-green-700">
                                Responded by {feedback.response.respondedBy?.name || 'Admin'} on{' '}
                                {new Date(feedback.response.respondedAt).toLocaleDateString()} at{' '}
                                {new Date(feedback.response.respondedAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedFeedback(feedback._id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                        >
                          <Send size={16} />
                          Respond to Feedback
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full FAQ Section (bottom of page) */}
        {activeTab === 'submit' && (
          <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div key={index + 100} className="border-b border-gray-200 py-4 last:border-0">
                  <button
                    onClick={() => toggleFAQ(index + 100)}
                    className="flex justify-between items-start w-full text-left gap-4"
                  >
                    <span className="font-medium text-gray-800 text-base flex-1">
                      {faq.question}
                    </span>
                    {openIndex === index + 100 ? (
                      <ChevronUp className="text-blue-600 flex-shrink-0" size={20} />
                    ) : (
                      <ChevronDown className="text-blue-600 flex-shrink-0" size={20} />
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openIndex === index + 100 ? "max-h-96 mt-3" : "max-h-0"
                    }`}
                  >
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpSupport;