import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Tooltip, Button, Divider } from '@mui/material';
import { logout } from '../../services/authService';

export default function Sidebar1({ user, isMobile, onClose }) {
  const navigate = useNavigate();
  const verified = user?.verified || true;

  const handleProfileEdit = () => {
    navigate('/dashboard/editProfile');
    if (onClose) onClose(); // Close mobile sidebar after navigation
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      if (onClose) onClose();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to home
      navigate('/');
      if (onClose) onClose();
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      padding: isMobile ? 20 : 24, 
      textAlign: 'center',
      position: 'relative'
    }}>
      {/* Mobile Close Button */}
      {isMobile && onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'gray'
          }}
        >
          <CloseIcon />
        </IconButton>
      )}

      {/* Profile Avatar Section */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
        <Tooltip title="Click to edit profile">
          <Avatar
            src={user?.avatar || "https://randomuser.me/api/portraits/men/75.jpg"}
            sx={{ 
              width: isMobile ? 80 : 72, 
              height: isMobile ? 80 : 72, 
              margin: "0 auto",
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={handleProfileEdit}
          />
        </Tooltip>
        
        {/* Edit icon overlay */}
        <IconButton
          onClick={handleProfileEdit}
          size="small"
          sx={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            backgroundColor: 'primary.main',
            color: 'white',
            width: 24,
            height: 24,
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}
        >
          <EditIcon sx={{ fontSize: 12 }} />
        </IconButton>
      </div>
      
      {/* User Info */}
      <h2 style={{ 
        margin: '16px 0 8px', 
        fontWeight: 600,
        fontSize: isMobile ? '1.25rem' : '1rem'
      }}>
        {user?.name}
      </h2>
      
      {/* Verification Status */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 8,
        marginBottom: 16
      }}>
        {verified ? (
          <CheckCircleIcon color="success" />
        ) : (
          <CancelIcon color="error" />
        )}
        <span style={{ 
          fontWeight: 500,
          fontSize: isMobile ? '0.9rem' : '0.875rem'
        }}>
          {verified ? 'Verified' : 'Unverified'} Account
        </span>
      </div>
      
      {/* User Details */}
      <div style={{ 
        marginTop: 12, 
        color: '#555', 
        fontSize: isMobile ? 15 : 14 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
          <LocationOnIcon fontSize="small" /> 
          <span>{user?.location || "Location"}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
          <EmailIcon fontSize="small" /> 
          <span style={{ fontSize: isMobile ? 14 : 13 }}>{user?.email || "Email"}</span>
        </div>
      </div>

      {/* Mobile-specific content */}
      {isMobile && (
        <>
          <Divider sx={{ margin: '16px 0' }} />
          
          {/* Role Badge */}
          <div style={{ 
            backgroundColor: user?.role === 'public-official' ? '#e8f5e8' : '#e3f2fd',
            color: user?.role === 'public-official' ? '#2e7d32' : '#1565c0',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            marginBottom: 16,
            textTransform: 'capitalize'
          }}>
            {user?.role?.replace('-', ' ') || 'Citizen'}
          </div>

          {/* Mobile Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Edit Profile Button */}
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleProfileEdit}
              fullWidth
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Edit Profile
            </Button>

            {/* Logout Button */}
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
          </div>

          <Divider sx={{ margin: '16px 0' }} />
          
          {/* Mobile Quick Stats */}
          <div style={{ 
            textAlign: 'left',
            backgroundColor: '#f8fafc',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.875rem'
          }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#374151' }}>
              Quick Info
            </div>
            <div style={{ color: '#6b7280', lineHeight: '1.5' }}>
              Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
            </div>
            {user?.department && (
              <div style={{ color: '#6b7280', lineHeight: '1.5' }}>
                Department: {user.department}
              </div>
            )}
            {user?.position && (
              <div style={{ color: '#6b7280', lineHeight: '1.5' }}>
                Position: {user.position}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
