import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
];

const HelpSupport = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [feedback, setFeedback] = useState("");

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle feedback submission here
    console.log("Feedback submitted:", feedback);
    alert("Thank you for your feedback!");
    setFeedback("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto lg:ml-8 lg:mr-4 px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Help & Support</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Got a question, suggestion, or issue? We'd love to hear from you. Drop your thoughts below, your feedback helps us improve Civix for everyone.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6">
            
            {/* Feedback Form */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:text-xl">Send us your feedback</h2>
              <form onSubmit={handleSubmit}>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="Type your question or feedback here..."
                  rows="4"
                  required
                />
                <div className="flex justify-start sm:justify-start mt-4">
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all text-sm sm:text-base w-full sm:w-auto"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* FAQ Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:text-2xl">Frequently Asked Questions</h2>
              <div className="space-y-1">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 py-3">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="flex justify-between items-center w-full text-left gap-4"
                    >
                      <span className="font-medium text-gray-800 text-sm sm:text-base flex-1 text-left">
                        {faq.question}
                      </span>
                      {openIndex === index ? (
                        <ChevronUp className="text-blue-600 flex-shrink-0" size={20} />
                      ) : (
                        <ChevronDown className="text-blue-600 flex-shrink-0" size={20} />
                      )}
                    </button>

                    {/* Collapsible Answer */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openIndex === index ? "max-h-96 mt-2" : "max-h-0"
                      }`}
                    >
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Help Section for Mobile */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 sm:hidden">
          <h3 className="font-semibold text-blue-900 mb-2">Need more help?</h3>
          <p className="text-blue-800 text-sm">
            Contact our support team at support@civix.com or call us at +1 (555) 123-4567
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;