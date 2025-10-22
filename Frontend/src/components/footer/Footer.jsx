import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  LinkedIn, 
  GitHub,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';
import Logo from "../../assets/images/Civix logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={Logo} 
                alt="Civix Logo" 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="text-xl font-bold">Civix</h3>
                <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">Beta</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Empowering citizens to create change through digital petitions, polls, and civic engagement. 
              Your voice matters, and we're here to amplify it.
            </p>
            
            {/* Social Media Links */}
            <div className="flex gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-blue-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-blue-700 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedIn className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-gray-600 transition-colors"
                aria-label="GitHub"
              >
                <GitHub className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/petitions" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Browse Petitions
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/polls" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Active Polls
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/reports" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Issue Reports
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/dashboard/help" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Help & Support
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/how-it-works" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link 
                  to="/community-guidelines" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link 
                  to="/success-stories" 
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Get In Touch</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Email className="w-4 h-4 text-blue-400" />
                <a 
                  href="mailto:support@civix.com" 
                  className="hover:text-white transition-colors"
                >
                  support@civix.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-green-400" />
                <a 
                  href="tel:+1234567890" 
                  className="hover:text-white transition-colors"
                >
                  +1 (234) 567-8900
                </a>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-300">
                <LocationOn className="w-4 h-4 text-red-400 mt-0.5" />
                <address className="not-italic">
                  123 Democracy Street<br />
                  Civic Center, CC 12345<br />
                  United States
                </address>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h5 className="text-sm font-medium mb-2 text-white">Stay Updated</h5>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <div className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Civix. All rights reserved. | Made with ❤️ for democracy
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
              <Link 
                to="/privacy-policy" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms-of-service" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                to="/cookies" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cookie Policy
              </Link>
              <Link 
                to="/accessibility" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </div>

          {/* Beta Notice */}
          <div className="mt-4 p-3 bg-yellow-900 bg-opacity-20 border border-yellow-800 rounded-lg">
            <p className="text-yellow-200 text-xs text-center">
              🚀 <strong>Beta Version:</strong> We're continuously improving Civix. 
              Have feedback? <Link to="/feedback" className="underline hover:text-yellow-100">Let us know!</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;