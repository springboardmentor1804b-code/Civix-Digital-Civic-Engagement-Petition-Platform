import React, { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';

const NotificationModal = () => {
  const [openNotif, setOpenNotif] = useState(false);
  const closeNotif = () => setOpenNotif(false);

  // Dummy notifications
  const notifications = [
    { id: 1, title: 'Petition Approved', body: 'Your petition "Fix Streetlights" has been approved.', time: '2 min ago' },
    { id: 2, title: 'Poll Closed', body: 'Poll "Weekly Market Holiday" has ended.', time: '1 hour ago' },
    { id: 3, title: 'Official Update', body: 'Official response added to your poll.', time: '3 hours ago' },
    { id: 4, title: 'Budget Sanctioned', body: 'Community-centre budget sanctioned.', time: '5 hours ago' },
    { id: 5, title: 'Signature Milestone', body: 'Your petition reached 500 signatures.', time: 'Yesterday' },
    { id: 6, title: 'New Poll Published', body: 'Poll "Dog Park Location" is now live.', time: 'Yesterday' },
    { id: 7, title: 'Petition Rejected', body: 'Petition "Allow 24×7 Hawkers" was rejected.', time: '2 days ago' },
    { id: 8, title: 'Traffic Light Fixed', body: 'New traffic lights installed at 5th & Main.', time: '2 days ago' },
    { id: 9, title: 'Extra Trucks Sanctioned', body: 'Ward-12 gets more waste-collection trucks.', time: '3 days ago' },
    { id: 10, title: 'Parade Permit Granted', body: 'Independence-Day parade permit approved.', time: '4 days ago' },
    { id: 11, title: 'Pothole Crew Dispatched', body: 'Lake-Rd pothole repair completed.', time: '5 days ago' },
    { id: 12, title: 'LED Upgrade Phase-2', body: 'LED street-light upgrade phase-2 approved.', time: '6 days ago' },
    { id: 13, title: 'Night-Market Response', body: 'Official response added to night-market poll.', time: '1 week ago' },
    { id: 14, title: 'Signature Count Verified', body: '"Dog Park" petition signatures verified.', time: '1 week ago' },
    { id: 15, title: 'Car-Ban Petition Closed', body: 'Unsuccessful "Ban all cars" petition closed.', time: '1 week ago' },
  ];

  return (
    <>
      {/* Bell Icon with Badge */}
      <IconButton color="inherit" onClick={() => setOpenNotif(true)}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Notification Modal */}
      {openNotif && (
        <>
          {/* Blurred Backdrop */}
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(4px)',
              zIndex: 1300,
            }}
            onClick={closeNotif}
          />

          {/* Modal Card */}
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: { xs: '90vw', sm: 520 },
              maxHeight: '80vh',
              bgcolor: '#ffffff',
              borderRadius: 3,
              boxShadow: 24,
              zIndex: 1301,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                py: 2,
                bgcolor: '#303f9f',
                color: '#fff',
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Notifications
              </Typography>
              <IconButton onClick={closeNotif} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,.18)' }} />

            {/* Scrollable Notification List */}
            <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1 }}>
              {notifications.map((n) => (
                <Box
                  key={n.id}
                  sx={{
                    mb: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    transition: 'background-color .2s',
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  <Typography variant="body2" fontWeight={600} color="#303f9f">
                    {n.title}
                  </Typography>
                  <Typography variant="caption" color="#616161">
                    {n.body}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mt={0.5}
                  >
                    {n.time}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}
    </>
  );
};

export default NotificationModal;
