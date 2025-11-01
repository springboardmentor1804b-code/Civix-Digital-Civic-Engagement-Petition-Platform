import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
<<<<<<< HEAD
export const Footer = () => {
  return <>
    <footer className="ml-14 md:ml-50 bg-[#0f172a] border-t border-[#1e293b] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">

        <div>
          <h2 className="text-2xl font-bold text-[#2563eb]">Civix</h2>
          <p className="mt-3 text-gray-300 text-lg">
=======

export const Footer = () => {
  return (
    <footer className="ml-14 md:ml-50 bg-[#e6b380] border-t border-[#d9985b] text-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">

        <div>
          <h2 className="text-2xl font-bold text-[#b36f40]">Civix</h2>
          <p className="mt-3 text-gray-800 text-lg">
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            Empowering communities by giving citizens a platform to raise
            their voice, create petitions, and drive real change.
          </p>
        </div>

        <div>
<<<<<<< HEAD
          <h3 className="text-xl font-semibold text-[#2563eb] mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-300 text-lg">
            <li>
              <Link to="/home/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            </li>
            <li>
              <Link to="/home/petitions" className="hover:text-white transition-colors">Petitions</Link>
            </li>
            <li>
              <Link to="/home/polls" className="hover:text-white transition-colors">Polls</Link>
            </li>
            <li>
              <Link to="/home/reports" className="hover:text-white transition-colors">Reports</Link>
            </li>
=======
          <h3 className="text-xl font-semibold text-[#b36f40] mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-900 text-lg">
            <li><Link to="/home/dashboard" className="hover:text-[#d9985b] transition-colors">Dashboard</Link></li>
            <li><Link to="/home/petitions" className="hover:text-[#d9985b] transition-colors">Petitions</Link></li>
            <li><Link to="/home/polls" className="hover:text-[#d9985b] transition-colors">Polls</Link></li>
            <li><Link to="/home/reports" className="hover:text-[#d9985b] transition-colors">Reports</Link></li>
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
          </ul>
        </div>

        <div>
<<<<<<< HEAD
          <h3 className="text-xl font-semibold text-[#2563eb] mb-3">Resources</h3>
          <ul className="space-y-2 text-gray-300 text-lg">
            <li>
              <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            </li>
=======
          <h3 className="text-xl font-semibold text-[#b36f40] mb-3">Resources</h3>
          <ul className="space-y-2 text-gray-900 text-lg">
            <li><Link to="/about" className="hover:text-[#d9985b] transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-[#d9985b] transition-colors">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-[#d9985b] transition-colors">FAQ</Link></li>
            <li><Link to="/privacy" className="hover:text-[#d9985b] transition-colors">Privacy Policy</Link></li>
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
          </ul>
        </div>

        <div>
<<<<<<< HEAD
          <h3 className="text-xl font-semibold text-[#2563eb] mb-3">Follow Us</h3>
          <div className="flex space-x-4 text-xl text-gray-300">
            <a href="#" className="hover:text-[#2563eb] transition-colors"><FaFacebook /></a>
            <a href="#" className="hover:text-[#2563eb] transition-colors"><FaTwitter /></a>
            <a href="#" className="hover:text-[#2563eb] transition-colors"><FaInstagram /></a>
            <a href="#" className="hover:text-[#2563eb] transition-colors"><FaLinkedin /></a>
=======
          <h3 className="text-xl font-semibold text-[#b36f40] mb-3">Follow Us</h3>
          <div className="flex space-x-4 text-xl text-gray-900">
            <a href="#" className="hover:text-[#d9985b] transition-colors"><FaFacebook /></a>
            <a href="#" className="hover:text-[#d9985b] transition-colors"><FaTwitter /></a>
            <a href="#" className="hover:text-[#d9985b] transition-colors"><FaInstagram /></a>
            <a href="#" className="hover:text-[#d9985b] transition-colors"><FaLinkedin /></a>
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
          </div>
        </div>
      </div>

<<<<<<< HEAD
      <div className="border-t border-[#1e293b] py-4 text-center text-gray-400 text-lg">
        © {new Date().getFullYear()} Civix. All rights reserved.
      </div>
    </footer>

  </>
}
=======
      <div className="border-t border-[#d9985b] py-4 text-center text-gray-900 text-lg">
        © {new Date().getFullYear()} Civix. All rights reserved.
      </div>
    </footer>
  );
};
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
