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
import { getProfile } from "../../services/api";
import { searchService } from "../../services/searchService";
import SearchResults from "../search/SearchResults";
import { CircularProgress } from "@mui/material";
import NotificationModal from "./NotificationModal";
import Logo from "../../assets/images/Civix logo.jpg";

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
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setAnchorEl(null);
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
              <IconButton color="inherit" onClick={handleDrawerOpen}><MenuIcon /></IconButton>
              <IconButton color="inherit" onClick={handleLogout}><LogoutIcon /></IconButton>
              {searchOpen && (
                <Box sx={{ position: 'absolute', top: 64, left: 16, right: 16, bgcolor: 'white', borderRadius: 2, boxShadow: 3, p: 1, zIndex: 200 }}>
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
                  {showResults && <SearchResults results={searchResults} searchQuery={searchQuery} onClose={handleCloseSearchResults} onItemClick={() => setSearchOpen(false)} />}
                </Box>
              )}
              <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
                <Box sx={{ width: 250, p: 2, position: 'relative', height: '100%' }}>
                  <IconButton onClick={handleDrawerClose} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}><CloseIcon /></IconButton>
                  <Box sx={{ mt: 5 }}><DashboardBar /></Box>
                </Box>
              </Drawer>
            </>
          ) : (
            <>
              {/* Desktop search */}
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'white', borderRadius: 2, px: 1, minWidth: 200 }}>
                  <InputBase placeholder="Search" value={searchQuery} onChange={handleSearchInputChange} onFocus={handleSearchFocus} onBlur={handleSearchBlur}
                    endAdornment={<IconButton type="submit" sx={{ p: '8px' }} aria-label="search">{searchLoading ? <CircularProgress size={20} sx={{ color: 'primary.main' }} /> : <SearchIcon sx={{ color: 'primary.main' }} />}</IconButton>}
                    sx={{ ml: 1, flex: 1, color: 'black' }}
                  />
                </Box>
                {showResults && <SearchResults results={searchResults} searchQuery={searchQuery} onClose={handleCloseSearchResults} />}
              </Box>

              {/* Notification Modal Component */}
              <NotificationModal />

              {/* profile */}
              <Box onClick={handleAvatarClick} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
                <Avatar alt={user?.name || 'User'} src="https://randomuser.me/api/portraits/men/75.jpg  " sx={{ width: 36, height: 36, ml: 1 }} />
                <ArrowDropDownIcon sx={{ color: 'white', ml: 0.5, transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </Box>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ '& .MuiPaper-root': { minWidth: 180, mt: 1 } }}>
                <MenuItem disabled><Typography variant="body1" sx={{ fontWeight: 700 }}>{user?.name || 'Guest'}</Typography></MenuItem>
                <MenuItem onClick={handleLogout} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LogoutIcon fontSize="small" /><Typography variant="body1" sx={{ fontWeight: 500 }}>Logout</Typography></MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
