import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import Avatar from "@mui/material/Avatar";
import HomeIcon from "@mui/icons-material/Home";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import EditIcon from "@mui/icons-material/Edit";
import ReportIcon from "@mui/icons-material/Report";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import DashboardBar from '../dashboard/DashboardBar';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Button, Divider } from '@mui/material';
import { getProfile } from "../../services/api";
import { searchService } from "../../services/searchService";
import SearchResults from "../search/SearchResults";
import { CircularProgress } from "@mui/material";
import NotificationModal from "./NotificationModal";
import Logo from "../../assets/images/Civix logo.jpg";

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function stringToColor(string) {
  if (!string) return '#1976d2';
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate();

  // Fetch logged-in user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getProfile();
        setUser(response.user);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchUser();
  }, []);

  // Listen for profile updates from Settings
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const updatedUser = event.detail;
      setUser(updatedUser);
      console.log('Navbar: Profile updated', updatedUser);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  // Search functionality
  const handleSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults(null);
      setShowResults(false);
      return;
    }
    setSearchLoading(true);
    try {
      const results = await searchService.searchAll(query.trim());
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ polls: [], petitions: [], reports: [], total: 0, error: error.message });
      setShowResults(true);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchInputChange = (e) => setSearchQuery(e.target.value);
  const handleSearchFocus = () => setShowResults(true);
  const handleSearchBlur  = () => setTimeout(() => setShowResults(false), 200);
  const handleCloseSearchResults = () => {
    setShowResults(false); setSearchQuery(''); setSearchResults(null);
  };

  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleSearchClick = () => setSearchOpen((p) => !p);
  const handleDrawerOpen  = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);
  const handleMenuClose   = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setAnchorEl(null);
  };

  const handleSettings = () => {
    navigate('/dashboard/settings');
    setAnchorEl(null);
  };

  const verified = user?.verified || user?.isVerified || true;

  const getLocationDisplay = () => {
    if (user?.locationString) return user.locationString;
    if (user?.location && typeof user.location === 'string') return user.location;
    if (user?.address) {
      const { city, state, country } = user.address;
      const parts = [city, state, country].filter(Boolean);
      if (parts.length > 0) return parts.join(', ');
    }
    return 'No location set';
  };

  // ✅ UPDATED: Unified profile dropdown design for both mobile and desktop
  const renderMenuItems = () => {
    return [
      <Box key="profile-menu" sx={{ p: 2, textAlign: 'center', minWidth: isMobile ? 280 : 320 }}>
        <Avatar
          sx={{ 
            width: isMobile ? 80 : 72,
            height: isMobile ? 80 : 72,
            margin: "0 auto 16px",
            bgcolor: stringToColor(user?.name),
            fontSize: isMobile ? '2rem' : '1.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
          onClick={handleSettings}
        >
          {getInitials(user?.name)}
        </Avatar>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: isMobile ? '1.25rem' : '1.1rem' }}>
          {user?.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          {verified ? (
            <CheckCircleIcon color="success" fontSize="small" />
          ) : (
            <CancelIcon color="error" fontSize="small" />
          )}
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {verified ? 'Verified' : 'Unverified'} Account
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1 }}>
          <LocationOnIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {getLocationDisplay()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 2 }}>
          <EmailIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
            {user?.email}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ 
          backgroundColor: user?.role === 'public-official' ? '#e8f5e8' : '#e3f2fd',
          color: user?.role === 'public-official' ? '#2e7d32' : '#1565c0',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '600',
          mb: 2,
          textTransform: 'capitalize'
        }}>
          {user?.role?.replace('-', ' ') || 'Citizen'}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleSettings}
            fullWidth
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Settings
          </Button>

          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            fullWidth
            sx={{ 
              backgroundColor: '#dc2626',
              '&:hover': {
                backgroundColor: '#b91c1c'
              },
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Logout
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ 
          textAlign: 'left',
          backgroundColor: '#f8fafc',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '0.875rem'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>
            Quick Info
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: '1.5' }}>
            Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
          </Typography>
          
          {getLocationDisplay() !== 'No location set' && (
            <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: '1.5' }}>
              Location: {getLocationDisplay()}
            </Typography>
          )}
          
          {user?.department && (
            <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: '1.5' }}>
              Department: {user.department}
            </Typography>
          )}
          
          {user?.position && (
            <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: '1.5' }}>
              Position: {user.position}
            </Typography>
          )}
        </Box>
      </Box>
    ];
  };

  return (
    <AppBar position="fixed" color="primary" sx={{ zIndex: 100 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 64 }}>
        {/* Left: Logo, Civix, Beta */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar src={Logo} alt="Civix Logo" sx={{ width: 40, height: 40, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
            Civix
          </Typography>
          {!isMobile && (
            <Typography
              variant="caption"
              sx={{ bgcolor: 'yellow', color: 'black', px: 1, borderRadius: 1, ml: 1 }}
            >
              Beta
            </Typography>
          )}
        </Box>

        {/* Center: Navigation Links (desktop) */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton color="inherit" onClick={() => navigate('/')}><HomeIcon /><Typography variant="body1" sx={{ ml: 0.5 }}>Home</Typography></IconButton>
            <IconButton color="inherit" onClick={() => navigate('/dashboard/petitions')}><EditIcon /><Typography variant="body1" sx={{ ml: 0.5 }}>Petitions</Typography></IconButton>
            <IconButton color="inherit" onClick={() => navigate('/dashboard/polls')}><HowToVoteIcon /><Typography variant="body1" sx={{ ml: 0.5 }}>Polls</Typography></IconButton>
            <IconButton color="inherit" onClick={() => navigate('/dashboard/reports')}><ReportIcon /><Typography variant="body1" sx={{ ml: 0.5 }}>Reports</Typography></IconButton>
          </Box>
        )}

        {/* Right: controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={handleSearchClick}><SearchIcon /></IconButton>
              {/* show notifications on mobile too */}
              <NotificationModal />
              <IconButton color="inherit" onClick={handleDrawerOpen}><MenuIcon /></IconButton>

              <Box
                onClick={handleAvatarClick}
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', ml: 0.5 }}
              >
                <Avatar
                  alt={user?.name || 'User'}
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: stringToColor(user?.name),
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {getInitials(user?.name)}
                </Avatar>
                <ArrowDropDownIcon 
                  sx={{ 
                    color: 'white', 
                    ml: 0.25, 
                    transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.2s' 
                  }} 
                />
              </Box>

               {searchOpen && (
                 <Box sx={{ 
                   position: 'absolute', 
                   top: 64, 
                   left: 16, 
                   right: 16, 
                   bgcolor: 'white', 
                   borderRadius: 2, 
                   boxShadow: 3, 
                   p: 1, 
                   zIndex: 200 
                 }}>
                   <InputBase
                     autoFocus
                     placeholder="Search polls, petitions, reports..."
                     value={searchQuery}
                     onChange={handleSearchInputChange}
                     onFocus={handleSearchFocus}
                     onBlur={handleSearchBlur}
                     endAdornment={searchLoading ? <CircularProgress size={20} sx={{ color: 'primary.main', mr: 1 }} /> : null}
                     sx={{ ml: 1, flex: 1, color: 'black', width: '100%', pr: 4 }}
                   />
                   {showResults && (
                     <SearchResults 
                       results={searchResults} 
                       searchQuery={searchQuery} 
                       onClose={handleCloseSearchResults} 
                       onItemClick={() => setSearchOpen(false)} 
                     />
                   )}
                 </Box>
               )}
               <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
                 <Box sx={{ width: 250, p: 2, position: 'relative', height: '100%' }}>
                   <IconButton 
                     onClick={handleDrawerClose} 
                     sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
                   >
                     <CloseIcon />
                   </IconButton>
                   <Box sx={{ mt: 5 }}><DashboardBar /></Box>
                 </Box>
               </Drawer>
             </>
           ) : (
            <>
               {/* Desktop search */}
               <Box sx={{ position: 'relative' }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'white', borderRadius: 2, px: 1, minWidth: 200 }}>
                   <InputBase 
                     placeholder="Search" 
                     value={searchQuery} 
                     onChange={handleSearchInputChange} 
                     onFocus={handleSearchFocus} 
                     onBlur={handleSearchBlur}
                     endAdornment={
                       <IconButton type="submit" sx={{ p: '8px' }} aria-label="search">
                         {searchLoading ? (
                           <CircularProgress size={20} sx={{ color: 'primary.main' }} />
                         ) : (
                           <SearchIcon sx={{ color: 'primary.main' }} />
                         )}
                       </IconButton>
                     }
                     sx={{ ml: 1, flex: 1, color: 'black' }}
                   />
                 </Box>
                 {showResults && (
                   <SearchResults 
                     results={searchResults} 
                     searchQuery={searchQuery} 
                     onClose={handleCloseSearchResults} 
                   />
                 )}
               </Box>
 
               {/* Notification Modal Component */}
               <NotificationModal />
 
               {/* profile */}
               <Box 
                 onClick={handleAvatarClick} 
                 sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
               >
                 <Avatar 
                   alt={user?.name || 'User'} 
                   sx={{ 
                     width: 36, 
                     height: 36, 
                     ml: 1,
                     bgcolor: stringToColor(user?.name),
                     fontSize: '1rem',
                     fontWeight: 600
                   }} 
                 >
                   {getInitials(user?.name)}
                 </Avatar>
                 <ArrowDropDownIcon 
                   sx={{ 
                     color: 'white', 
                     ml: 0.5, 
                     transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'rotate(0deg)', 
                     transition: 'transform 0.2s' 
                   }} 
                 />
               </Box>
             </>
           )}
         </Box>
      </Toolbar>

      {/* ✅ UPDATED: Unified profile dropdown menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ 
          '& .MuiPaper-root': { 
            minWidth: isMobile ? 280 : 320,
            mt: 1,
            maxHeight: isMobile ? '80vh' : '70vh',
            overflowY: 'auto'
          } 
        }}
      >
        {renderMenuItems()}
      </Menu>
    </AppBar>
  );
}
