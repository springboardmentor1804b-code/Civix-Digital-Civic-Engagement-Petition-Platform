import { Link } from 'react-router-dom';

import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import homeBg from '../assets/images/homeBg.jpg';
import Logo from "../assets/images/Civix logo.jpg";
import Avatar from "@mui/material/Avatar";
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';


function Home() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="fixed" sx={{ height: 64, justifyContent: 'center' }}>
                    <Toolbar sx={{ minHeight: 64, justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar src={Logo} alt="Civix Logo" sx={{ width: 40, height: 40, mr: 1 }} />
                            <Typography variant="h6" color="inherit" component="div">
                                Civix
                            </Typography>
                        </Box>
                        <Box>
                            <Button color="inherit" component={Link} to="/login" sx={{ mr: 1 }}>
                                Login
                            </Button>
                            <Button color="inherit" component={Link} to="/register" variant="outlined" sx={{ bgcolor: 'white', color: 'primary.main', borderColor: 'primary.main' }}>
                                Sign Up
                            </Button>
                        </Box>
                    </Toolbar>
                </AppBar>
            </Box>
            {/* Main content with dark blue overlay background and rounded bottom corners */}
            <div
                style={{
                    position: 'relative',
                    paddingTop: 64,
                    minHeight: 'calc(100vh)',                   
                    overflow: 'hidden',
                }}

                className="items-center justify-center"
            >
                {/* Background image with dark blue overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${homeBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: 1,                        
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(17, 37, 84, 0.85)',
                        zIndex: 2,                       
                    }}
                />
                {/* Centered heading and paragraph in the background */}
                <div
                    className="relative z-10 flex flex-col items-center justify-center"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <h1 className="text-4xl font-extrabold text-white mb-4 text-center">Digital Civic Engagement Platform</h1>
                    <p className="text-lg text-gray-200 mb-8 max-w-2xl text-center">
                        Civix enables citizens to engage in local governance through petitions, voting, and tracking officials' responses. Join our platform to make your voice heard and drive positive change in your community.
                    </p>
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/login"
                        sx={{ mt: 2, fontWeight: 'bold', fontSize: '1rem', borderRadius: 2, boxShadow: 2 }}
                    >
                        Sign In
                    </Button>
                </div>
            </div>
            {/* Containers below heading */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-0" style={{paddingTop: 80, paddingBottom: 80}}>
                <div className="flex flex-col lg:flex-row gap-8 lg:h-[300px]">
                    {/* Container 1 */}
                    <div className="flex-1 bg-blue-700 rounded-xl flex flex-col justify-center items-center p-6 sm:p-8 min-h-[200px] lg:min-h-0" style={{boxShadow: '0 8px 32px 0 rgba(17,37,84,0.25)'}}>
                        <EditIcon sx={{ fontSize: { xs: 40, sm: 48 }, color: 'white', mb: 2 }} />
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">Create and Sign Petitions</h2>
                        <p className="text-white text-center text-sm sm:text-base max-w-xs">
                            Easily create petitions for issues you care about and gather support from your community.
                        </p>
                    </div>
                    
                    {/* Container 2 */}
                    <div className="flex-1 bg-blue-700 rounded-xl flex flex-col justify-center items-center p-6 sm:p-8 min-h-[200px] lg:min-h-0" style={{boxShadow: '0 8px 32px 0 rgba(17,37,84,0.25)'}}>
                        <HowToVoteIcon sx={{ fontSize: { xs: 40, sm: 48 }, color: 'white', mb: 2 }} />
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">Participate in Public Polls</h2>
                        <p className="text-white text-center text-sm sm:text-base max-w-xs">
                            Vote on local issues and see real time results of community sentiment in our platform.
                        </p>
                    </div>
                    
                    {/* Container 3 */}
                    <div className="flex-1 bg-blue-700 rounded-xl flex flex-col justify-center items-center p-6 sm:p-8 min-h-[200px] lg:min-h-0" style={{boxShadow: '0 8px 32px 0 rgba(17,37,84,0.25)'}}>
                        <CheckCircleIcon sx={{ fontSize: { xs: 40, sm: 48 }, color: 'white', mb: 2 }} />
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">Track Official Responses</h2>
                        <p className="text-white text-center text-sm sm:text-base max-w-xs">
                            See how local officials respond to community concerns and track progress on issues.
                        </p>
                    </div>
                </div>
            </div>
            {/* Footer */}
            <Footer />
        </div>
    );
}

export default Home;
