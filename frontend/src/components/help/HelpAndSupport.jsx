// A basic help page component to start with.
function HelpAndSupport() {
    
    const FAQItem = ({ question, answer }) => (
        <div className="mb-4">
            <h4 className="text-md font-bold text-gray-800">Q: {question}</h4>
            <p className="mt-1 text-gray-600">A: {answer}</p>
        </div>
    );

    return (
        <div className="pt-20 p-4 bg-gradient-to-b from-sky-200 to-gray-300 min-h-screen md:pl-54">
            <div className="pl-6 pt-6">
                <h1 className="text-3xl font-bold text-gray-800 font-inria">Help & Support</h1>
                <p className="text-gray-700 mt-1 font-bold">Find answers and get in touch.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6 max-w-3xl mx-auto">
                
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Frequently Asked Questions (FAQ)</h2>

                {/* --- Petitions Section --- */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-blue-700 mb-3">Petitions</h3>
                    <FAQItem 
                        question="How do I create a petition?"
                        answer="Navigate to the 'Petitions' page from the sidebar and click the '+ Create Petition' button. Fill out all the required fields, including title, description, category, signature goal, and location, then click 'Submit Petition'."
                    />
                    <FAQItem 
                        question="How do I edit or delete my petition?"
                        answer="You can only edit or delete petitions you have created. Go to the 'Petitions' page and click the 'My Petitions' tab. You will see edit (pencil) and delete (trash) icons on your petition cards."
                    />
                    <FAQItem 
                        question="What do the petition statuses (Active, Closed) mean?"
                        answer="'Active' means the petition is currently open and collecting signatures. 'Closed' means the petition is no longer collecting signatures. This status can only be changed by a Public Officer."
                    />
                </div>

                {/* --- Polls Section --- */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-blue-700 mb-3">Polls</h3>
                    <FAQItem 
                        question="How do I create a poll?"
                        answer="Go to the 'Polls' page and click the '+ Create Poll' button. You must provide a question, at least 2 options (and up to 5), a target location, and an optional closing date."
                    />
                    <FAQItem 
                        question="How do I vote?"
                        answer="On the 'Polls' page, find an 'Active' poll you have not voted in yet. Simply click on the option you wish to vote for. Once you vote, you will see the results."
                    />
                     <FAQItem 
                        question="Can I change my vote?"
                        answer="No, once a vote is cast, it cannot be changed or recalled."
                    />
                </div>

                {/* --- Account Section --- */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-blue-700 mb-3">Account</h3>
                    <FAQItem 
                        question="How do I change my name or password?"
                        answer="Navigate to the 'Settings' page by clicking the gear icon in the header or the 'Settings' link in the sidebar. You will find forms to update your profile information and change your password."
                    />
                    <FAQItem 
                        question="How do I delete my account?"
                        answer="On the 'Settings' page, scroll down to the 'Danger Zone'. You will find a button to permanently delete your account. Please be aware this action cannot be undone."
                    />
                </div>

                {/* --- Contact Section --- */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-t pt-6">Contact Us</h2>
                <p className="text-gray-600">
                    If you can't find the answer you're looking for, please don't hesitate to email our support team at <strong className="text-blue-600 cursor-pointer hover:underline">support@civix.com</strong>.
                </p>

            </div>
        </div>
    );
}

export default HelpAndSupport;