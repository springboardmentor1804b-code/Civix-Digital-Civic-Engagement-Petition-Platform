// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, isPublicOfficial } from '../../services/authService';
import Navbar from '../../components/navbar/Navbar';
import Sidebar1 from '../../components/sidebar/Sidebar1';
import Welcome from '../../components/dashboard/Welcome';
import DashboardBar from '../../components/dashboard/DashboardBar';
import { getProfile } from "../../services/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Responsive: check if mobile
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 600 : false
  );

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getProfile();
        setUser(data.user);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        // If profile fetch fails, redirect to login
        navigate('/login');
      }
    };
    
    fetchUser();
  }, [navigate]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(typeof window !== 'undefined' ? window.innerWidth <= 600 : false);
      // Close mobile sidebar when switching to desktop
      if (window.innerWidth > 600) {
        setShowMobileSidebar(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setShowMobileSidebar(false);
  }, [location.pathname]);

  // Check if current route is dashboard index
  const isDashboardIndex = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  // Handle mobile profile dropdown toggle
  const handleMobileProfileToggle = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  // Show loading while fetching user data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no user data, show error state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Unable to load user data</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={user} 
        isMobile={isMobile}
        onMobileProfileClick={handleMobileProfileToggle}
        showMobileSidebar={showMobileSidebar}
      />
      
      {isMobile ? (
        // Mobile Layout
        <>
          {/* Mobile Sidebar Dropdown - Conditional rendering */}
          {showMobileSidebar && (
            <div 
              className="fixed inset-0 z-50 bg-black bg-opacity-50"
              style={{ marginTop: 64 }}
              onClick={handleMobileProfileToggle}
            >
              <div 
                className="absolute top-0 right-0 w-80 max-w-[90vw] bg-white shadow-2xl rounded-bl-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Sidebar1 
                  user={user} 
                  isMobile={true}
                  onClose={handleMobileProfileToggle}
                />
              </div>
            </div>
          )}
          
          {/* Mobile Welcome - Only on dashboard index */}
          {isDashboardIndex && (
            <div style={{ 
              width: '100%', 
              padding: '16px', 
              marginTop: 70 
            }}>
              <Welcome user={user} />
            </div>
          )}
          
          {/* Mobile Content */}
          <div style={{ 
            width: '100%', 
            padding: '16px', 
            
          }}>
            <Outlet />
          </div>
        </>
      ) : (
        // Desktop Layout
        <div style={{ 
          display: 'flex', 
          marginTop: 64 
        }}>
          {/* Desktop Left Sidebar */}
          <div style={{ 
            width: 280, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            background: '#fff', 
            minHeight: 'calc(100vh - 64px)', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
          }}>
            <Sidebar1 user={user} />
            <DashboardBar />
          </div>
          
          {/* Desktop Right Content */}
          <div style={{ 
            flex: 1, 
            padding: '32px', 
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            {/* Desktop Welcome - Only on dashboard index */}
            {isDashboardIndex && <Welcome user={user} />}
            
            {/* Main Content Area */}
            <div>
              <Outlet />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}